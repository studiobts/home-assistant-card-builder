import type { EventBus } from '@/common/core/event-bus';
import type { BlockData, DocumentModel } from '@/common/core/model';
import type { LinkEditorSelection, LinkModeState } from '@/common/core/model/types';
import type {
    LinkAnchorPoint,
    LinkCurvePreset,
    LinkPoint,
    LinkSegment,
    LinkSegmentType
} from '@/common/blocks/components/advanced/block-link/link-types';
import { clampNormalized, ensureSegments, normalizePoint } from '@/common/blocks/components/advanced/block-link/link-utils';
import type { BlockRegistry } from '@/common/blocks/core/registry/block-registry';
import { createContext } from '@lit/context';
import type { LinkEditorPreferences } from '@/panel/designer/components/editors/link-editor/link-editor-preferences';
import { DEFAULT_LINK_EDITOR_PREFERENCES } from '@/panel/designer/components/editors/link-editor/link-editor-preferences';

const GRID_STEP = 5;
const SNAP_THRESHOLD_PX = 8;

type LinkModeControllerOptions = {
    documentModel: DocumentModel;
    eventBus: EventBus;
    blockRegistry: BlockRegistry;
    preferences?: LinkEditorPreferences;
};

type SnapGuide = {
    x?: { x: number; y1: number; y2: number };
    y?: { y: number; x1: number; x2: number };
};

type SnapTarget =
    | { kind: 'point'; id: string; x: number; y: number }
    | { kind: 'handle'; id: string; x: number; y: number }
    | { kind: 'block'; id: string; x: number; y: number };

export class LinkModeController {
    private documentModel: DocumentModel;
    private eventBus: EventBus;
    private blockRegistry: BlockRegistry;
    private state: LinkModeState;
    private activeLinkId: string | null = null;
    private linkElement: HTMLElement | null = null;
    private drawListenersAttached = false;
    private pickListenerAttached = false;
    private attachRetryHandle: number | null = null;
    private dragListenersAttached = false;
    private dragging: { blockId: string; pointId: string; handle?: 'in' | 'out'; } | null = null;
    private snapGuideBlockId: string | null = null;
    private preferences: LinkEditorPreferences = {...DEFAULT_LINK_EDITOR_PREFERENCES};
    private snapBlocksCache: BlockData[] | null = null;
    private pathDragging: { blockId: string; start: { x: number; y: number }; startClient: { x: number; y: number }; moved: boolean; points: LinkPoint[]; } | null = null;

    constructor(options: LinkModeControllerOptions) {
        this.documentModel = options.documentModel;
        this.eventBus = options.eventBus;
        this.blockRegistry = options.blockRegistry;
        if (options.preferences) {
            this.preferences = {...options.preferences};
        }
        this.state = this.documentModel.getLinkModeState();
        this.activeLinkId = this.state.activeLinkId ?? null;

        this.documentModel.addEventListener('link-mode-changed', this._handleLinkModeChanged as EventListener);
        this.documentModel.addEventListener('block-deleted', this._handleBlockDeleted as EventListener);
        this.documentModel.addEventListener('link-editor-selection-changed', this._handleLinkSelectionChanged as EventListener);
        this._applyState(this.state);
    }

    destroy(): void {
        this.documentModel.removeEventListener('link-mode-changed', this._handleLinkModeChanged as EventListener);
        this.documentModel.removeEventListener('block-deleted', this._handleBlockDeleted as EventListener);
        this.documentModel.removeEventListener('link-editor-selection-changed', this._handleLinkSelectionChanged as EventListener);
        this._detachDrawListeners();
        this._detachPickListener();
        this._detachOutsideListener();
        this._detachDragListeners();
        this._cancelLinkElementRetry();
        this.eventBus.dispatchEvent('link-preview-clear', {blockId: this.activeLinkId ?? undefined});
        this._clearSnapGuide();
        this.documentModel.setLinkAnchorHighlight(null);
    }

    setPreferences(preferences: LinkEditorPreferences): void {
        this.preferences = {...preferences};
    }

    toggleLinkMode(): void {
        if (this.state.enabled) {
            this.closeEditor();
            return;
        }
        this.startNewLink();
    }

    startNewLink(): void {
        const linkBlock = this._createLinkBlock();
        if (!linkBlock) return;

        this.documentModel.select(linkBlock.id);
        this.documentModel.setLinkModeState({
            enabled: true,
            mode: 'draw',
            activeLinkId: linkBlock.id,
            anchorPickPointId: null,
        });
        this.documentModel.setLinkEditorSelection({
            blockId: linkBlock.id,
            pointId: null,
            segmentIndex: null,
            handle: null,
        });
        this.eventBus.dispatchEvent('link-editor-open', {blockId: linkBlock.id});
    }

    openEditor(blockId: string): void {
        const block = this.documentModel.getBlock(blockId);
        if (!block || block.type !== 'block-link') return;

        this.documentModel.select(blockId);
        this.documentModel.setLinkModeState({
            enabled: true,
            mode: 'edit',
            activeLinkId: blockId,
            anchorPickPointId: null,
        });
        this.documentModel.setLinkEditorSelection({
            blockId,
            pointId: null,
            segmentIndex: null,
            handle: null,
        });
        this.eventBus.dispatchEvent('link-editor-open', {blockId});
    }

    closeEditor(): void {
        this.documentModel.setLinkModeState({
            enabled: false,
            mode: 'idle',
            activeLinkId: null,
            anchorPickPointId: null,
        });
        this.documentModel.setLinkEditorSelection({blockId: null, pointId: null, segmentIndex: null, handle: null});
        this.eventBus.dispatchEvent('link-editor-close');
        this.eventBus.dispatchEvent('link-preview-clear', {blockId: this.activeLinkId ?? undefined});
        this._clearSnapGuide();
        this.pathDragging = null;
    }

    finishDrawing(): void {
        this._finishDrawing();
    }

    selectPoint(blockId: string, pointId: string): void {
        this.documentModel.setLinkEditorSelection({
            blockId,
            pointId,
            segmentIndex: null,
            handle: null,
        });
    }

    selectSegment(blockId: string, segmentIndex: number): void {
        this.documentModel.setLinkEditorSelection({
            blockId,
            pointId: null,
            segmentIndex,
            handle: null,
        });
    }

    startPathDrag(blockId: string, e: PointerEvent): void {
        if (!this._isEditingActive(blockId) || this.state.mode !== 'edit') return;
        if (e.button !== 0) return;
        const start = this._getNormalizedFromEventForLink(blockId, e);
        if (!start) return;
        const block = this.documentModel.getBlock(blockId);
        if (!block) return;
        this.pathDragging = {
            blockId,
            start,
            startClient: {x: e.clientX, y: e.clientY},
            moved: false,
            points: this._getLinkPoints(block).map((p) => ({...p})),
        };
        this.documentModel.setLinkEditorSelection({
            blockId,
            pointId: null,
            segmentIndex: null,
            handle: null,
        });
        this._attachDragListeners();
        e.stopPropagation();
        e.preventDefault();
    }

    updateProp(blockId: string, name: string, value: unknown): void {
        this.documentModel.updateBlock(blockId, {
            props: {
                [name]: {value},
            },
        });
    }

    updatePointCoordinate(blockId: string, pointId: string, axis: 'x' | 'y', value: number): void {
        const block = this.documentModel.getBlock(blockId);
        if (!block) return;
        const points = this._getLinkPoints(block);
        const nextPoints = points.map((point) => {
            if (point.id !== pointId) return point;
            const nextValue = clampNormalized(value);
            const nextPoint = {
                ...point,
                [axis]: nextValue,
            } as LinkPoint;

            if (point.anchor?.blockId) {
                const anchorBase = this._getAnchorBaseForLink(blockId, point.anchor.blockId, point.anchor.anchor || 'middle-center');
                if (anchorBase) {
                    const nextX = axis === 'x' ? nextValue : point.x;
                    const nextY = axis === 'y' ? nextValue : point.y;
                    nextPoint.anchor = {
                        ...point.anchor,
                        offset: {
                            x: this._clampOffset(nextX - anchorBase.x),
                            y: this._clampOffset(nextY - anchorBase.y),
                        },
                    };
                }
            }

            return nextPoint;
        });
        const adjusted = this._applyCurveAutoUpdate(blockId, nextPoints, pointId);
        this._updateGeometry(blockId, adjusted);
    }

    toggleAnchor(blockId: string, pointId: string, enabled: boolean): void {
        const block = this.documentModel.getBlock(blockId);
        if (!block) return;

        if (enabled) {
            this.enterAnchorPick(blockId, pointId);
            return;
        }

        const points = this._getLinkPoints(block);
        const nextPoints = points.map((point) => {
            if (point.id !== pointId) return point;
            const resolved = this._resolvePointPosition(blockId, point);
            return {
                ...point,
                x: resolved.x,
                y: resolved.y,
                anchor: undefined,
            };
        });
        this._updateGeometry(blockId, nextPoints);
        this.documentModel.setLinkModeState({mode: 'edit', anchorPickPointId: null});
        this._syncAnchorHighlight(this.documentModel.getLinkEditorSelection());
    }

    enterAnchorPick(blockId: string, pointId: string): void {
        this.documentModel.setLinkEditorSelection({
            blockId,
            pointId,
            segmentIndex: null,
            handle: null,
        });
        this.documentModel.setLinkModeState({
            enabled: true,
            mode: 'pick-anchor',
            activeLinkId: blockId,
            anchorPickPointId: pointId,
        });
    }

    updateAnchorPoint(blockId: string, pointId: string, anchor: LinkAnchorPoint): void {
        const block = this.documentModel.getBlock(blockId);
        if (!block) return;
        const points = this._getLinkPoints(block);
        const nextPoints = points.map((point) => {
            if (point.id !== pointId) return point;
            if (point.anchor?.blockId) {
                const currentPos = this._resolvePointPosition(blockId, point);
                const anchorBase = this._getAnchorBaseForLink(blockId, point.anchor.blockId, anchor);
                if (anchorBase) {
                    return {
                        ...point,
                        anchor: {
                            ...point.anchor,
                            anchor,
                            offset: {
                                x: this._clampOffset(currentPos.x - anchorBase.x),
                                y: this._clampOffset(currentPos.y - anchorBase.y),
                            },
                        },
                    };
                }
            }

            return {
                ...point,
                anchor: {
                    ...(point.anchor || {blockId: ''}),
                    anchor,
                },
            };
        });
        this._updateGeometry(blockId, nextPoints);
        this._syncAnchorHighlight(this.documentModel.getLinkEditorSelection());
    }

    updateAnchorOffset(blockId: string, pointId: string, axis: 'x' | 'y', value: number): void {
        const block = this.documentModel.getBlock(blockId);
        if (!block) return;
        const points = this._getLinkPoints(block);
        const nextPoints = points.map((point) => {
            if (point.id !== pointId) return point;
            const offset = point.anchor?.offset ?? {x: 0, y: 0};
            return {
                ...point,
                anchor: {
                    ...(point.anchor || {blockId: ''}),
                    offset: {
                        ...offset,
                        [axis]: this._clampOffset(value),
                    },
                },
            };
        });
        this._updateGeometry(blockId, nextPoints);
    }

    setSegmentType(blockId: string, index: number, type: LinkSegment['type']): void {
        const block = this.documentModel.getBlock(blockId);
        if (!block) return;
        const points = this._getLinkPoints(block);
        const segments = ensureSegments(points, this._getLinkSegments(block));
        const nextSegments = segments.map((segment, idx) => {
            if (idx !== index) return segment;
            if (type === 'curve') {
                return {
                    ...segment,
                    type,
                    curvePreset: segment.curvePreset ?? 'smooth',
                    curveBulge: typeof segment.curveBulge === 'number' ? segment.curveBulge : 0.25,
                    curveAutoUpdate: Boolean(segment.curveAutoUpdate ?? false),
                };
            }
            return {type};
        });
        let nextPoints = points;
        if (type === 'curve') {
            nextPoints = this._applyCurvePreset(blockId, points, index, nextSegments[index]);
        }
        this._updateGeometry(blockId, nextPoints, nextSegments);
    }

    setSegmentCurvePreset(blockId: string, index: number, preset: LinkCurvePreset): void {
        const block = this.documentModel.getBlock(blockId);
        if (!block) return;
        const points = this._getLinkPoints(block);
        const segments = ensureSegments(points, this._getLinkSegments(block));
        if (index < 0 || index >= segments.length) return;

        const nextSegments = segments.map((segment, idx) => (
            idx === index
                ? {
                      ...segment,
                      type: 'curve' as LinkSegmentType,
                      curvePreset: preset,
                      curveBulge: typeof segment.curveBulge === 'number' ? segment.curveBulge : 0.25,
                      curveAutoUpdate: Boolean(segment.curveAutoUpdate ?? false),
                  }
                : segment
        ));

        const nextPoints = this._applyCurvePreset(blockId, points, index, nextSegments[index]);
        this._updateGeometry(blockId, nextPoints, nextSegments);
    }

    setSegmentCurveBulge(blockId: string, index: number, value: number): void {
        const block = this.documentModel.getBlock(blockId);
        if (!block) return;
        const points = this._getLinkPoints(block);
        const segments = ensureSegments(points, this._getLinkSegments(block));
        if (index < 0 || index >= segments.length) return;

        const nextSegments = segments.map((segment, idx) => (
            idx === index
                ? {
                      ...segment,
                      type: 'curve' as LinkSegmentType,
                      curveBulge: this._clampBulge(value),
                      curvePreset: segment.curvePreset ?? 'arc',
                      curveAutoUpdate: Boolean(segment.curveAutoUpdate ?? false),
                  }
                : segment
        ));

        const nextPoints = this._applyCurvePreset(blockId, points, index, nextSegments[index]);
        this._updateGeometry(blockId, nextPoints, nextSegments);
    }

    setSegmentCurveAutoUpdate(blockId: string, index: number, enabled: boolean): void {
        const block = this.documentModel.getBlock(blockId);
        if (!block) return;
        const points = this._getLinkPoints(block);
        const segments = ensureSegments(points, this._getLinkSegments(block));
        if (index < 0 || index >= segments.length) return;

        const nextSegments = segments.map((segment, idx) => (
            idx === index
                ? {
                      ...segment,
                      type: 'curve' as LinkSegmentType,
                      curveAutoUpdate: enabled,
                      curvePreset: segment.curvePreset ?? 'smooth',
                      curveBulge: typeof segment.curveBulge === 'number' ? segment.curveBulge : 0.25,
                  }
                : segment
        ));

        let nextPoints = points;
        if (enabled && nextSegments[index].curvePreset !== 'manual') {
            nextPoints = this._applyCurvePreset(blockId, points, index, nextSegments[index]);
        }

        this._updateGeometry(blockId, nextPoints, nextSegments);
    }

    deletePoint(blockId: string, pointId: string): void {
        const block = this.documentModel.getBlock(blockId);
        if (!block) return;
        const points = this._getLinkPoints(block);
        if (points.length <= 2) return;
        const index = points.findIndex((point) => point.id === pointId);
        if (index === -1) return;

        const nextPoints = points.filter((point) => point.id !== pointId);
        const segments = ensureSegments(points, this._getLinkSegments(block));
        const nextSegments = [...segments];
        if (index === 0) {
            nextSegments.splice(0, 1);
        } else {
            nextSegments.splice(index - 1, 1);
        }
        this._updateGeometry(blockId, nextPoints, nextSegments);
        this.documentModel.setLinkEditorSelection({
            blockId,
            pointId: null,
            segmentIndex: null,
            handle: null,
        });
    }

    handleLineContextMenu(blockId: string, e: MouseEvent): void {
        if (!this._isEditingActive(blockId)) return;
        if (this.state.mode === 'draw') return;
        e.preventDefault();
        e.stopPropagation();

        const normalizedPoint = this._getNormalizedFromEventForLink(blockId, e);
        if (!normalizedPoint) return;

        const block = this.documentModel.getBlock(blockId);
        if (!block) return;
        const points = this._getLinkPoints(block);
        if (points.length < 2) return;

        const resolvedPoints = this._getResolvedPoints(blockId);
        const renderScale = this._getRenderScaleForLink(blockId);
        const clickPoint = renderScale
            ? this._getRenderPointFromEvent(blockId, e)
            : normalizedPoint;
        if (!clickPoint) return;

        const pointsForDistance = renderScale ? this._toRenderPoints(resolvedPoints, renderScale) : resolvedPoints;
        const segmentIndex = this._findNearestSegment(pointsForDistance, clickPoint);

        const newPoint: LinkPoint = {
            id: this._generateLinkPointId(),
            x: normalizedPoint.x,
            y: normalizedPoint.y,
        };

        const nextPoints = [...points];
        nextPoints.splice(segmentIndex + 1, 0, newPoint);

        const segments = ensureSegments(points, this._getLinkSegments(block));
        const nextSegments = [...segments];
        nextSegments.splice(segmentIndex, 1, {type: 'line'}, {type: 'line'});

        this._updateGeometry(blockId, nextPoints, nextSegments);
        this.documentModel.setLinkEditorSelection({
            blockId,
            pointId: newPoint.id,
            segmentIndex: null,
            handle: null,
        });
    }

    handlePointContextMenu(blockId: string, e: MouseEvent, pointId: string): void {
        if (!this._isEditingActive(blockId)) return;
        e.preventDefault();
        e.stopPropagation();
        this.deletePoint(blockId, pointId);
    }

    startPointDrag(blockId: string, e: PointerEvent, pointId: string): void {
        if (!this._isEditingActive(blockId)) return;
        e.stopPropagation();
        this.dragging = {blockId, pointId};
        this._clearSnapGuide(blockId);
        this.documentModel.setLinkEditorSelection({
            blockId,
            pointId,
            segmentIndex: null,
            handle: null,
        });
        this._attachDragListeners();
    }

    startHandleDrag(blockId: string, e: PointerEvent, pointId: string, handle: 'in' | 'out'): void {
        if (!this._isEditingActive(blockId)) return;
        e.stopPropagation();
        this.dragging = {blockId, pointId, handle};
        this._clearSnapGuide(blockId);
        this.documentModel.setLinkEditorSelection({
            blockId,
            pointId,
            segmentIndex: null,
            handle,
        });
        this._attachDragListeners();
    }

    private _handleLinkModeChanged = (e: Event): void => {
        const detail = (e as CustomEvent<{ state: LinkModeState }>).detail;
        this._applyState(detail?.state ?? {enabled: false, mode: 'idle', activeLinkId: null});
    };

    private _handleLinkSelectionChanged = (e: Event): void => {
        const detail = (e as CustomEvent<{ selection: LinkEditorSelection }>).detail;
        this._syncAnchorHighlight(detail?.selection ?? null);
    };

    private _syncAnchorHighlight(selection: LinkEditorSelection | null): void {
        if (!selection || !selection.blockId || !selection.pointId) {
            this.documentModel.setLinkAnchorHighlight(null);
            return;
        }
        if (!this.state.enabled || this.state.mode !== 'edit') {
            this.documentModel.setLinkAnchorHighlight(null);
            return;
        }
        if (!this.activeLinkId || selection.blockId !== this.activeLinkId) {
            this.documentModel.setLinkAnchorHighlight(null);
            return;
        }

        const block = this.documentModel.getBlock(selection.blockId);
        if (!block) {
            this.documentModel.setLinkAnchorHighlight(null);
            return;
        }
        const point = this._getLinkPoints(block).find((p) => p.id === selection.pointId);
        const anchorId = point?.anchor?.blockId ?? null;
        this.documentModel.setLinkAnchorHighlight(anchorId);
    }

    private _handleBlockDeleted = (e: Event): void => {
        const detail = (e as CustomEvent<{ blockId: string }>).detail;
        if (!detail?.blockId) return;
        if (this.activeLinkId && detail.blockId === this.activeLinkId) {
            this.closeEditor();
        }
        this._cleanupAnchorsForDeletedBlock(detail.blockId);
    };

    private _applyState(state: LinkModeState): void {
        const prevActive = this.activeLinkId;
        this.state = state;
        this.activeLinkId = state.activeLinkId ?? null;
        if (prevActive && this.activeLinkId !== prevActive) {
            this.pathDragging = null;
        }
        if (!state.enabled || !state.activeLinkId) {
            this.snapBlocksCache = null;
        }
        if (!state.enabled || state.mode !== 'edit') {
            this.documentModel.setLinkAnchorHighlight(null);
        } else {
            this._syncAnchorHighlight(this.documentModel.getLinkEditorSelection());
        }
        this._syncDrawListeners();
        this._syncPickListener();
        if (this.dragging && (!this._isEditingActive(this.dragging.blockId))) {
            this._endDrag();
        }

        if (!state.enabled || state.mode !== 'draw') {
            this.eventBus.dispatchEvent('link-preview-clear', {blockId: state.activeLinkId ?? undefined});
        }

        if (!state.enabled || !state.activeLinkId) {
            this.pathDragging = null;
        }
    }

    private _syncDrawListeners(): void {
        const shouldListen = Boolean(this.state.enabled && this.state.mode === 'draw' && this.activeLinkId);
        if (!shouldListen) {
            this._detachDrawListeners();
            this._detachOutsideListener();
            this._cancelLinkElementRetry();
            this.linkElement = null;
            return;
        }

        const linkEl = this._getActiveLinkElement();
        if (!linkEl) {
            this._scheduleLinkElementRetry();
            return;
        }

        if (this.linkElement !== linkEl) {
            this._detachDrawListeners();
            this.linkElement = linkEl;
        }

        this._attachDrawListeners();
        this._attachOutsideListener();
    }

    private _syncPickListener(): void {
        const shouldListen = Boolean(this.state.enabled && this.state.mode === 'pick-anchor' && this.activeLinkId && this.state.anchorPickPointId);
        if (shouldListen) {
            this._attachPickListener();
        } else {
            this._detachPickListener();
        }
    }

    private _attachDrawListeners(): void {
        if (this.drawListenersAttached || !this.linkElement) return;
        this.linkElement.addEventListener('pointerdown', this._handleLinkPointerDown);
        this.linkElement.addEventListener('pointermove', this._handleLinkPointerMove);
        this.linkElement.addEventListener('pointerleave', this._handleLinkPointerLeave);
        this.linkElement.addEventListener('contextmenu', this._handleLinkContextMenu);
        this.drawListenersAttached = true;
    }

    private _detachDrawListeners(): void {
        if (!this.drawListenersAttached || !this.linkElement) return;
        this.linkElement.removeEventListener('pointerdown', this._handleLinkPointerDown);
        this.linkElement.removeEventListener('pointermove', this._handleLinkPointerMove);
        this.linkElement.removeEventListener('pointerleave', this._handleLinkPointerLeave);
        this.linkElement.removeEventListener('contextmenu', this._handleLinkContextMenu);
        this.drawListenersAttached = false;
    }

    private _attachOutsideListener(): void {
        // No-op: we don't exit draw mode on outside clicks
    }

    private _detachOutsideListener(): void {
        // No-op: we don't exit draw mode on outside clicks
    }

    private _scheduleLinkElementRetry(): void {
        if (this.attachRetryHandle !== null) return;
        this.attachRetryHandle = window.requestAnimationFrame(() => {
            this.attachRetryHandle = null;
            if (!this.state.enabled || this.state.mode !== 'draw' || !this.activeLinkId) return;
            this._syncDrawListeners();
        });
    }

    private _cancelLinkElementRetry(): void {
        if (this.attachRetryHandle === null) return;
        window.cancelAnimationFrame(this.attachRetryHandle);
        this.attachRetryHandle = null;
    }

    private _attachPickListener(): void {
        if (this.pickListenerAttached) return;
        document.addEventListener('pointerdown', this._handlePickAnchor, true);
        this.pickListenerAttached = true;
    }

    private _detachPickListener(): void {
        if (!this.pickListenerAttached) return;
        document.removeEventListener('pointerdown', this._handlePickAnchor, true);
        this.pickListenerAttached = false;
    }

    private _handleLinkPointerDown = (e: PointerEvent): void => {
        if (!this.state.enabled || this.state.mode !== 'draw' || !this.activeLinkId) return;
        if (e.button !== 0) return;
        if (!this.linkElement) return;

        const rawPoint = this._getNormalizedFromEvent(e, this.linkElement);
        if (!rawPoint) return;
        const connectedPointIds = this._getConnectedPointIdsForDraw(this.activeLinkId);
        const snapResult = this._applySnapping(this.activeLinkId, rawPoint, {
            connectedPointIds,
        });
        this._emitSnapGuide(this.activeLinkId, snapResult.guide);
        this._addPoint(this.activeLinkId, snapResult.point);
        this.documentModel.select(this.activeLinkId);
        e.stopPropagation();
        e.preventDefault();
    };

    private _handleLinkPointerMove = (e: PointerEvent): void => {
        if (!this.state.enabled || this.state.mode !== 'draw' || !this.activeLinkId) return;
        if (!this.linkElement) return;
        const rawPoint = this._getNormalizedFromEvent(e, this.linkElement);
        if (!rawPoint) return;
        const connectedPointIds = this._getConnectedPointIdsForDraw(this.activeLinkId);
        const snapResult = this._applySnapping(this.activeLinkId, rawPoint, {
            connectedPointIds,
        });
        this._emitSnapGuide(this.activeLinkId, snapResult.guide);
        this.eventBus.dispatchEvent('link-preview-move', {blockId: this.activeLinkId, point: snapResult.point});
    };

    private _handleLinkPointerLeave = (): void => {
        if (!this.state.enabled || this.state.mode !== 'draw') return;
        this.eventBus.dispatchEvent('link-preview-clear', {blockId: this.activeLinkId ?? undefined});
        this._clearSnapGuide();
    };

    private _handleLinkContextMenu = (e: MouseEvent): void => {
        if (!this.state.enabled || this.state.mode !== 'draw') return;
        e.preventDefault();
        e.stopPropagation();
        this._finishDrawing();
    };


    private _finishDrawing(): void {
        if (!this.state.enabled || this.state.mode !== 'draw') return;
        this.documentModel.setLinkModeState({mode: 'edit', anchorPickPointId: null});
        this.eventBus.dispatchEvent('link-preview-clear', {blockId: this.activeLinkId ?? undefined});
        this._clearSnapGuide();
    }

    private _handlePickAnchor = (e: PointerEvent): void => {
        if (!this.state.enabled || this.state.mode !== 'pick-anchor') return;
        if (e.button !== 0) {
            e.stopPropagation();
            e.preventDefault();
            return;
        }
        if (!this.activeLinkId || !this.state.anchorPickPointId) {
            e.stopPropagation();
            e.preventDefault();
            return;
        }

        const blockId = this._getBlockIdFromEvent(e);
        if (!blockId || blockId === this.activeLinkId) {
            e.stopPropagation();
            e.preventDefault();
            return;
        }

        this._applyAnchorPick(this.activeLinkId, this.state.anchorPickPointId, blockId);
        this.documentModel.setLinkModeState({mode: 'edit', anchorPickPointId: null});
        e.stopPropagation();
        e.preventDefault();
    };

    private _addPoint(blockId: string, point: { x: number; y: number }): void {
        const block = this.documentModel.getBlock(blockId);
        if (!block) return;

        const points = this._getLinkPoints(block);
        const segments = this._getLinkSegments(block);

        const newPoint: LinkPoint = {
            id: this._generateLinkPointId(),
            x: clampNormalized(point.x),
            y: clampNormalized(point.y),
        };

        const nextPoints = [...points, newPoint];
        const nextSegments = ensureSegments(nextPoints, segments);

        this.documentModel.updateBlock(blockId, {
            props: {
                points: nextPoints,
                segments: nextSegments,
            },
        });
        this.documentModel.setLinkEditorSelection({
            blockId,
            pointId: newPoint.id,
            segmentIndex: null,
            handle: null,
        });
    }

    private _applyAnchorPick(linkBlockId: string, pointId: string, targetBlockId: string): void {
        const linkBlock = this.documentModel.getBlock(linkBlockId);
        if (!linkBlock) return;

        const points = this._getLinkPoints(linkBlock);
        const pointIndex = points.findIndex((point) => point.id === pointId);
        if (pointIndex === -1) return;

        const anchorPoint = points[pointIndex].anchor?.anchor || 'middle-center';
        const currentPos = this._resolvePointPosition(linkBlockId, points[pointIndex]);
        const anchorBase = this._getAnchorBaseForLink(linkBlockId, targetBlockId, anchorPoint);
        if (!anchorBase) return;

        const offset = {
            x: this._clampOffset(currentPos.x - anchorBase.x),
            y: this._clampOffset(currentPos.y - anchorBase.y),
        };

        const updatedPoint: LinkPoint = {
            ...points[pointIndex],
            anchor: {
                blockId: targetBlockId,
                anchor: anchorPoint,
                offset,
            },
        };

        const nextPoints = [...points];
        nextPoints[pointIndex] = updatedPoint;

        this.documentModel.updateBlock(linkBlockId, {
            props: {
                points: nextPoints,
            },
        });
        this.documentModel.setLinkEditorSelection({
            blockId: linkBlockId,
            pointId: updatedPoint.id,
            segmentIndex: null,
            handle: null,
        });
        this._syncAnchorHighlight({blockId: linkBlockId, pointId: updatedPoint.id, segmentIndex: null, handle: null});
    }

    private _attachDragListeners(): void {
        if (this.dragListenersAttached) return;
        window.addEventListener('pointermove', this._handleDragMove);
        window.addEventListener('pointerup', this._handleDragEnd);
        window.addEventListener('pointercancel', this._handleDragEnd);
        this.dragListenersAttached = true;
    }

    private _detachDragListeners(): void {
        if (!this.dragListenersAttached) return;
        window.removeEventListener('pointermove', this._handleDragMove);
        window.removeEventListener('pointerup', this._handleDragEnd);
        window.removeEventListener('pointercancel', this._handleDragEnd);
        this.dragListenersAttached = false;
    }

    private _endDrag(): void {
        this.dragging = null;
        this._detachDragListeners();
    }

    private _applyDeltaToPoints(
        blockId: string,
        points: LinkPoint[],
        delta: { x: number; y: number }
    ): LinkPoint[] {
        return points.map((point) => {
            const resolved = this._resolvePointPosition(blockId, point);
            const nextX = clampNormalized(resolved.x + delta.x);
            const nextY = clampNormalized(resolved.y + delta.y);
            const nextPoint: LinkPoint = {
                ...point,
                x: nextX,
                y: nextY,
            };

            if (point.anchor?.blockId) {
                const anchorBase = this._getAnchorBaseForLink(blockId, point.anchor.blockId, point.anchor.anchor || 'middle-center');
                if (anchorBase) {
                    nextPoint.anchor = {
                        ...point.anchor,
                        offset: {
                            x: this._clampOffset(nextX - anchorBase.x),
                            y: this._clampOffset(nextY - anchorBase.y),
                        },
                    };
                }
            }

            return nextPoint;
        });
    }

    private _handleDragMove = (e: PointerEvent): void => {
        if (this.pathDragging) {
            const {blockId, start, points, startClient} = this.pathDragging;
            if (!this._isEditingActive(blockId) || this.state.mode !== 'edit') {
                this.pathDragging = null;
                return;
            }
            const current = this._getNormalizedFromEventForLink(blockId, e);
            if (!current) return;
            const movedDistance = Math.hypot(e.clientX - startClient.x, e.clientY - startClient.y);
            if (!this.pathDragging.moved) {
                if (movedDistance < 3) {
                    return;
                }
                this.pathDragging.moved = true;
            }
            const delta = {
                x: current.x - start.x,
                y: current.y - start.y,
            };
            const nextPoints = this._applyDeltaToPoints(blockId, points, delta);
            this._updateGeometry(blockId, nextPoints);
            return;
        }

        if (!this.dragging) return;
        const {blockId, pointId, handle} = this.dragging;
        if (!this._isEditingActive(blockId)) {
            this._endDrag();
            return;
        }
        const point = this._getNormalizedFromEventForLink(blockId, e);
        if (!point) return;

        if (!handle) {
            const snapResult = this._applySnapping(blockId, point, {
                excludePointId: pointId,
                currentPointId: pointId,
            });
            this._emitSnapGuide(blockId, snapResult.guide);
            this._updatePointPosition(blockId, pointId, snapResult.point);
            return;
        }

        const snapResult = this._applySnapping(blockId, point, {
            includeHandles: true,
            excludeHandle: {pointId, handle},
            currentPointId: pointId,
        });
        this._emitSnapGuide(blockId, snapResult.guide);
        this._updateHandlePosition(blockId, pointId, handle, snapResult.point);
    };

    private _handleDragEnd = (): void => {
        if (this.pathDragging && !this.pathDragging.moved) {
            this._selectSegmentAtPoint(this.pathDragging.blockId, this.pathDragging.start);
        }
        this._endDrag();
        this.pathDragging = null;
        this._clearSnapGuide();
    };

    private _selectSegmentAtPoint(blockId: string, normalizedPoint: { x: number; y: number }): void {
        if (!this._isEditingActive(blockId)) return;
        if (this.state.mode !== 'edit') return;

        const resolvedPoints = this._getResolvedPoints(blockId);
        if (resolvedPoints.length < 2) return;

        const renderScale = this._getRenderScaleForLink(blockId);
        if (renderScale) {
            const pointsForDistance = this._toRenderPoints(resolvedPoints, renderScale);
            const clickPoint = {x: normalizedPoint.x * renderScale.sx, y: normalizedPoint.y * renderScale.sy};
            const segmentIndex = this._findNearestSegment(pointsForDistance, clickPoint);
            this.documentModel.setLinkEditorSelection({
                blockId,
                pointId: null,
                segmentIndex,
                handle: null,
            });
            return;
        }

        const segmentIndex = this._findNearestSegment(resolvedPoints, normalizedPoint);
        this.documentModel.setLinkEditorSelection({
            blockId,
            pointId: null,
            segmentIndex,
            handle: null,
        });
    }

    private _createLinkBlock(): BlockData | null {
        const defaults = this.blockRegistry.getDefaults('block-link');
        if (!defaults) return null;

        const entityDefaults = this.blockRegistry.getEntityDefaults('block-link');
        return this.documentModel.createBlock(
            'block-link',
            this.documentModel.rootId,
            {
                ...defaults,
                entityConfig: {
                    mode: entityDefaults.mode || 'inherited',
                    slotId: entityDefaults.slotId,
                },
            },
            {
                layout: 'static',
            }
        );
    }

    private _updateGeometry(blockId: string, points: LinkPoint[], segments?: LinkSegment[]): void {
        const props: Record<string, unknown> = {points};
        if (segments) {
            props.segments = segments;
        }
        this.documentModel.updateBlock(blockId, {props});
    }

    private _applyCurvePreset(blockId: string, points: LinkPoint[], index: number, segment: LinkSegment): LinkPoint[] {
        if (segment.type !== 'curve') return points;
        const preset = segment.curvePreset ?? 'smooth';
        if (preset === 'manual') return points;

        const start = points[index];
        const end = points[index + 1];
        if (!start || !end) return points;

        const startPos = this._resolvePointPosition(blockId, start);
        const endPos = this._resolvePointPosition(blockId, end);

        let handleOut = {x: 0, y: 0};
        let handleIn = {x: 0, y: 0};

        if (preset === 'smooth') {
            const prev = points[index - 1] ?? start;
            const nextNext = points[index + 2] ?? end;
            const prevPos = this._resolvePointPosition(blockId, prev);
            const nextNextPos = this._resolvePointPosition(blockId, nextNext);
            const scale = 1 / 6;

            const cp1 = {
                x: startPos.x + (endPos.x - prevPos.x) * scale,
                y: startPos.y + (endPos.y - prevPos.y) * scale,
            };
            const cp2 = {
                x: endPos.x - (nextNextPos.x - startPos.x) * scale,
                y: endPos.y - (nextNextPos.y - startPos.y) * scale,
            };

            handleOut = {x: cp1.x - startPos.x, y: cp1.y - startPos.y};
            handleIn = {x: cp2.x - endPos.x, y: cp2.y - endPos.y};
        } else if (preset === 'arc' || preset === 'symmetric') {
            const dx = endPos.x - startPos.x;
            const dy = endPos.y - startPos.y;
            const len = Math.hypot(dx, dy);
            if (len > 0) {
                const nx = -dy / len;
                const ny = dx / len;
                const bulge = this._clampBulge(segment.curveBulge ?? 0.25);
                const along = len * (1 / 3);
                const offsetScale = preset === 'arc' ? 0.35 : 0.2;
                const offset = bulge * len * offsetScale;

                handleOut = {
                    x: dx * (along / len) + nx * offset,
                    y: dy * (along / len) + ny * offset,
                };
                handleIn = {
                    x: -dx * (along / len) + nx * offset,
                    y: -dy * (along / len) + ny * offset,
                };
            }
        }

        const nextPoints = points.map((point) => ({...point}));
        nextPoints[index] = {...nextPoints[index], handleOut};
        nextPoints[index + 1] = {...nextPoints[index + 1], handleIn};
        return nextPoints;
    }

    private _clampBulge(value: number): number {
        if (Number.isNaN(value)) return 0;
        return Math.max(-1, Math.min(1, value));
    }

    private _applyCurveAutoUpdate(blockId: string, points: LinkPoint[], pointId: string): LinkPoint[] {
        const index = points.findIndex((point) => point.id === pointId);
        if (index === -1) return points;
        const block = this.documentModel.getBlock(blockId);
        if (!block) return points;
        const segments = ensureSegments(points, this._getLinkSegments(block));

        let nextPoints = points;
        const maybeApply = (segmentIndex: number) => {
            if (segmentIndex < 0 || segmentIndex >= segments.length) return;
            const segment = segments[segmentIndex];
            if (!segment || segment.type !== 'curve') return;
            if (segment.curvePreset === 'manual') return;
            if (!segment.curveAutoUpdate) return;
            nextPoints = this._applyCurvePreset(blockId, nextPoints, segmentIndex, segment);
        };

        maybeApply(index - 1);
        maybeApply(index);

        return nextPoints;
    }

    private _getLinkPoints(block: { props?: Record<string, unknown> }): LinkPoint[] {
        const raw = block.props?.points;
        return Array.isArray(raw) ? (raw as LinkPoint[]) : [];
    }

    private _getLinkSegments(block: { props?: Record<string, unknown> }): LinkSegment[] {
        const raw = block.props?.segments;
        return Array.isArray(raw) ? (raw as LinkSegment[]) : [];
    }

    private _getPropValue<T>(blockId: string, prop: string, fallback: T): T {
        const block = this.documentModel.getBlock(blockId);
        const value = block?.props?.[prop];
        if (value && typeof value === 'object' && 'value' in (value as { value?: T })) {
            return (value as { value?: T }).value ?? fallback;
        }
        return fallback;
    }

    private _resolvePointPosition(linkBlockId: string, point: LinkPoint): { x: number; y: number } {
        if (point.anchor?.blockId) {
            const anchorBase = this._getAnchorBaseForLink(linkBlockId, point.anchor.blockId, point.anchor.anchor || 'middle-center');
            if (anchorBase) {
                const offset = point.anchor.offset ?? {
                    x: point.x - anchorBase.x,
                    y: point.y - anchorBase.y,
                };
                return {
                    x: clampNormalized(anchorBase.x + offset.x),
                    y: clampNormalized(anchorBase.y + offset.y),
                };
            }
        }

        return {
            x: clampNormalized(point.x),
            y: clampNormalized(point.y),
        };
    }

    private _getResolvedPoints(linkBlockId: string): LinkPoint[] {
        const block = this.documentModel.getBlock(linkBlockId);
        if (!block) return [];
        return this._getLinkPoints(block).map((point) => ({
            ...point,
            ...this._resolvePointPosition(linkBlockId, point),
        }));
    }

    private _updatePointPosition(blockId: string, pointId: string, position: { x: number; y: number }): void {
        const block = this.documentModel.getBlock(blockId);
        if (!block) return;
        const points = this._getLinkPoints(block);
        const nextPoints = points.map((point) => {
            if (point.id !== pointId) return point;

            const updated: LinkPoint = {...point, x: position.x, y: position.y};
            if (point.anchor?.blockId) {
                const anchorBase = this._getAnchorBaseForLink(blockId, point.anchor.blockId, point.anchor.anchor || 'middle-center');
                if (anchorBase) {
                    const offset = {
                        x: this._clampOffset(position.x - anchorBase.x),
                        y: this._clampOffset(position.y - anchorBase.y),
                    };
                    updated.anchor = {
                        ...point.anchor,
                        offset,
                    };
                }
            }

            return normalizePoint(updated);
        });

        const adjusted = this._applyCurveAutoUpdate(blockId, nextPoints, pointId);
        this._updateGeometry(blockId, adjusted);
    }

    private _updateHandlePosition(blockId: string, pointId: string, handle: 'in' | 'out', position: { x: number; y: number }): void {
        const block = this.documentModel.getBlock(blockId);
        if (!block) return;
        const points = this._getLinkPoints(block);
        const segments = ensureSegments(points, this._getLinkSegments(block));
        let segmentsChanged = false;
        const nextSegments = segments.map((segment, index) => {
            if (segment.type !== 'curve' || segment.curvePreset === 'manual') return segment;
            const affectsSegment = (handle === 'out' && points[index]?.id === pointId)
                || (handle === 'in' && points[index + 1]?.id === pointId);
            if (!affectsSegment) return segment;
            segmentsChanged = true;
            return {
                ...segment,
                curvePreset: 'manual' as LinkCurvePreset,
                curveAutoUpdate: false,
            };
        });
        const nextPoints = points.map((point) => {
            if (point.id !== pointId) return point;

            const offset = {
                x: position.x - point.x,
                y: position.y - point.y,
            };

            if (handle === 'in') {
                return {
                    ...point,
                    handleIn: offset,
                };
            }

            return {
                ...point,
                handleOut: offset,
            };
        });

        this._updateGeometry(blockId, nextPoints, segmentsChanged ? nextSegments : undefined);
    }

    private _getAnchorBaseForLink(linkBlockId: string, blockId: string, anchor: LinkAnchorPoint): { x: number; y: number } | null {
        const refRect = this._getReferenceRect(linkBlockId);
        if (!refRect) return null;

        const anchorBlock = this.documentModel.getBlock(blockId);
        if (!anchorBlock) return null;

        const blockEl = this.documentModel.getElement(blockId);
        if (!blockEl) return null;

        const blockRect = blockEl.getBoundingClientRect();
        if (!refRect.width || !refRect.height) return null;

        const anchorOffset = this._getAnchorOffset(anchor, blockRect);
        return {
            x: clampNormalized(((anchorOffset.x - refRect.left) / refRect.width) * 100),
            y: clampNormalized(((anchorOffset.y - refRect.top) / refRect.height) * 100),
        };
    }

    private _getReferenceRect(linkBlockId: string): DOMRect | null {
        const linkEl = this.documentModel.getElement(linkBlockId) ?? this._getActiveLinkElement();
        if (!linkEl) return null;
        return linkEl.getBoundingClientRect();
    }

    private _getAnchorOffset(anchor: LinkAnchorPoint, rect: DOMRect): { x: number; y: number } {
        const xMap: Record<string, number> = {
            left: rect.left,
            center: rect.left + rect.width / 2,
            right: rect.right,
        };
        const yMap: Record<string, number> = {
            top: rect.top,
            middle: rect.top + rect.height / 2,
            bottom: rect.bottom,
        };

        const [vertical, horizontal] = anchor.split('-') as ['top' | 'middle' | 'bottom', 'left' | 'center' | 'right'];
        return {x: xMap[horizontal], y: yMap[vertical]};
    }

    private _cleanupAnchorsForDeletedBlock(blockId: string): void {
        if (this.documentModel.getLinkAnchorHighlight().blockId === blockId) {
            this.documentModel.setLinkAnchorHighlight(null);
        }

        const blocks = Object.values(this.documentModel.blocks);
        for (const block of blocks) {
            if (!block || block.type !== 'block-link') continue;
            const points = this._getLinkPoints(block);
            let changed = false;
            const nextPoints = points.map((point) => {
                if (point.anchor?.blockId !== blockId) return point;
                changed = true;
                const resolved = this._resolvePointPosition(block.id, point);
                return {
                    ...point,
                    x: resolved.x,
                    y: resolved.y,
                    anchor: undefined,
                };
            });

            if (changed) {
                this.documentModel.updateBlock(block.id, {
                    props: {
                        points: nextPoints,
                    },
                });
            }
        }
    }

    private _getNormalizedFromEvent(e: MouseEvent | PointerEvent, element: HTMLElement): { x: number; y: number } | null {
        const rect = element.getBoundingClientRect();
        if (!rect.width || !rect.height) return null;

        return {
            x: clampNormalized(((e.clientX - rect.left) / rect.width) * 100),
            y: clampNormalized(((e.clientY - rect.top) / rect.height) * 100),
        };
    }

    private _getNormalizedFromEventForLink(blockId: string, e: MouseEvent | PointerEvent): { x: number; y: number } | null {
        const refRect = this._getReferenceRect(blockId);
        if (!refRect || !refRect.width || !refRect.height) return null;

        return {
            x: clampNormalized(((e.clientX - refRect.left) / refRect.width) * 100),
            y: clampNormalized(((e.clientY - refRect.top) / refRect.height) * 100),
        };
    }

    private _applySnapping(
        blockId: string,
        point: { x: number; y: number },
        options?: {
            excludePointId?: string;
            currentPointId?: string;
            connectedPointIds?: string[];
            includeHandles?: boolean;
            excludeHandle?: { pointId: string; handle: 'in' | 'out' };
        }
    ): { point: { x: number; y: number }; guide?: SnapGuide } {
        const gridSnapEnabled = this.preferences.showGrid && this.preferences.snapToGrid;
        const pointSnapEnabled = this.preferences.snapToPoints;
        const blockSnapEnabled = this.preferences.snapToBlocks;

        if (!gridSnapEnabled && !pointSnapEnabled && !blockSnapEnabled) {
            return {point};
        }

        const refRect = this._getReferenceRect(blockId);
        if (!refRect || !refRect.width || !refRect.height) return {point};

        const thresholdX = (SNAP_THRESHOLD_PX / refRect.width) * 100;
        const thresholdY = (SNAP_THRESHOLD_PX / refRect.height) * 100;
        const rawX = point.x;
        const rawY = point.y;
        let nextX = point.x;
        let nextY = point.y;
        let snapXTarget: SnapTarget | null = null;
        let snapYTarget: SnapTarget | null = null;
        let bestXDistance = Number.POSITIVE_INFINITY;
        let bestYDistance = Number.POSITIVE_INFINITY;

        const considerX = (value: number, target?: SnapTarget | null) => {
            const distance = Math.abs(rawX - value);
            if (distance <= thresholdX && distance < bestXDistance) {
                bestXDistance = distance;
                nextX = value;
                snapXTarget = target ?? null;
            }
        };

        const considerY = (value: number, target?: SnapTarget | null) => {
            const distance = Math.abs(rawY - value);
            if (distance <= thresholdY && distance < bestYDistance) {
                bestYDistance = distance;
                nextY = value;
                snapYTarget = target ?? null;
            }
        };

        if (gridSnapEnabled) {
            const gridX = Math.round(rawX / GRID_STEP) * GRID_STEP;
            const gridY = Math.round(rawY / GRID_STEP) * GRID_STEP;
            considerX(gridX);
            considerY(gridY);
        }

        if (pointSnapEnabled) {
            const points = this._getResolvedPoints(blockId).filter((p) => p.id !== options?.excludePointId);
            if (points.length) {
                for (const p of points) {
                    considerX(p.x, {kind: 'point', id: p.id, x: p.x, y: p.y});
                    considerY(p.y, {kind: 'point', id: p.id, x: p.x, y: p.y});
                }
            }

            if (options?.includeHandles) {
                const handles = this._getHandleSnapTargets(blockId, options.excludeHandle);
                for (const h of handles) {
                    considerX(h.x, h);
                    considerY(h.y, h);
                }
            }
        }

        if (blockSnapEnabled) {
            const blocks = this._getSnapBlocks();
            for (const block of blocks) {
                const center = this._getAnchorBaseForLink(blockId, block.id, 'middle-center');
                if (!center) continue;
                considerX(center.x, {kind: 'block', id: block.id, x: center.x, y: center.y});
                considerY(center.y, {kind: 'block', id: block.id, x: center.x, y: center.y});

                const dx = rawX - center.x;
                const dy = rawY - center.y;
                if (Math.abs(dx) >= Math.abs(dy)) {
                    const top = this._getAnchorBaseForLink(blockId, block.id, 'top-center');
                    const bottom = this._getAnchorBaseForLink(blockId, block.id, 'bottom-center');
                    if (top) {
                        considerY(top.y, {kind: 'block', id: block.id, x: top.x, y: top.y});
                    }
                    if (bottom) {
                        considerY(bottom.y, {kind: 'block', id: block.id, x: bottom.x, y: bottom.y});
                    }
                } else {
                    const left = this._getAnchorBaseForLink(blockId, block.id, 'middle-left');
                    const right = this._getAnchorBaseForLink(blockId, block.id, 'middle-right');
                    if (left) {
                        considerX(left.x, {kind: 'block', id: block.id, x: left.x, y: left.y});
                    }
                    if (right) {
                        considerX(right.x, {kind: 'block', id: block.id, x: right.x, y: right.y});
                    }
                }
            }
        }

        const snappedPoint = {
            x: clampNormalized(nextX),
            y: clampNormalized(nextY),
        };

        const connected = new Set<string>(
            options?.connectedPointIds
                ?? this._getConnectedPointIds(blockId, options?.currentPointId)
        );

        let guide: SnapGuide | undefined;
        if (snapXTarget) {
            const target = snapXTarget as SnapTarget;
            const shouldShow = target.kind !== 'point' || !connected.has(target.id);
            if (shouldShow) {
                guide = {
                    ...(guide ?? {}),
                    x: {
                        x: target.x,
                        y1: Math.min(snappedPoint.y, target.y),
                        y2: Math.max(snappedPoint.y, target.y),
                    },
                };
            }
        }
        if (snapYTarget) {
            const target = snapYTarget as SnapTarget;
            const shouldShow = target.kind !== 'point' || !connected.has(target.id);
            if (shouldShow) {
                guide = {
                    ...(guide ?? {}),
                    y: {
                        y: target.y,
                        x1: Math.min(snappedPoint.x, target.x),
                        x2: Math.max(snappedPoint.x, target.x),
                    },
                };
            }
        }

        return {
            point: snappedPoint,
            guide,
        };
    }

    private _getConnectedPointIds(blockId: string, pointId?: string | null): string[] {
        if (!pointId) return [];
        const block = this.documentModel.getBlock(blockId);
        if (!block) return [];
        const points = this._getLinkPoints(block);
        const index = points.findIndex((p) => p.id === pointId);
        if (index === -1) return [];
        const ids: string[] = [];
        if (index > 0) ids.push(points[index - 1].id);
        if (index < points.length - 1) ids.push(points[index + 1].id);
        return ids;
    }

    private _getConnectedPointIdsForDraw(blockId: string): string[] {
        const block = this.documentModel.getBlock(blockId);
        if (!block) return [];
        const points = this._getLinkPoints(block);
        const last = points[points.length - 1];
        return last ? [last.id] : [];
    }

    private _getHandleSnapTargets(
        blockId: string,
        exclude?: { pointId: string; handle: 'in' | 'out' }
    ): SnapTarget[] {
        const points = this._getResolvedPoints(blockId);
        const targets: SnapTarget[] = [];
        for (const point of points) {
            if (point.handleIn) {
                if (!(exclude && exclude.pointId === point.id && exclude.handle === 'in')) {
                    targets.push({
                        kind: 'handle',
                        id: `${point.id}:in`,
                        x: clampNormalized(point.x + point.handleIn.x),
                        y: clampNormalized(point.y + point.handleIn.y),
                    });
                }
            }
            if (point.handleOut) {
                if (!(exclude && exclude.pointId === point.id && exclude.handle === 'out')) {
                    targets.push({
                        kind: 'handle',
                        id: `${point.id}:out`,
                        x: clampNormalized(point.x + point.handleOut.x),
                        y: clampNormalized(point.y + point.handleOut.y),
                    });
                }
            }
        }
        return targets;
    }

    private _getSnapBlocks(): BlockData[] {
        if (this.snapBlocksCache) return this.snapBlocksCache;
        this.snapBlocksCache = Object.values(this.documentModel.blocks)
            .filter((block) => block && block.id !== this.documentModel.rootId && block.type !== 'block-link');
        return this.snapBlocksCache;
    }

    private _emitSnapGuide(blockId: string, guide?: SnapGuide): void {
        if (!guide) {
            this._clearSnapGuide(blockId);
            return;
        }
        this.snapGuideBlockId = blockId;
        this.eventBus.dispatchEvent('link-snap-guide', {blockId, guide});
    }

    private _clearSnapGuide(blockId?: string): void {
        if (!this.snapGuideBlockId && !blockId) return;
        const targetId = blockId ?? this.snapGuideBlockId!;
        this.eventBus.dispatchEvent('link-snap-clear', {blockId: targetId});
        if (!blockId || blockId === this.snapGuideBlockId) {
            this.snapGuideBlockId = null;
        }
    }

    private _getRenderScaleForLink(blockId: string): { sx: number; sy: number } | null {
        const refRect = this._getReferenceRect(blockId);
        if (!refRect || !refRect.width || !refRect.height) return null;
        return {
            sx: refRect.width / 100,
            sy: refRect.height / 100,
        };
    }

    private _getRenderPointFromEvent(blockId: string, e: MouseEvent | PointerEvent): { x: number; y: number } | null {
        const refRect = this._getReferenceRect(blockId);
        if (!refRect || !refRect.width || !refRect.height) return null;
        return {
            x: e.clientX - refRect.left,
            y: e.clientY - refRect.top,
        };
    }

    private _toRenderPoints(points: LinkPoint[], scale: { sx: number; sy: number }): LinkPoint[] {
        return points.map((point) => this._toRenderPoint(point, scale));
    }

    private _toRenderPoint(point: LinkPoint, scale: { sx: number; sy: number }): LinkPoint {
        const {sx, sy} = scale;
        return {
            ...point,
            x: point.x * sx,
            y: point.y * sy,
            handleIn: point.handleIn ? {x: point.handleIn.x * sx, y: point.handleIn.y * sy} : undefined,
            handleOut: point.handleOut ? {x: point.handleOut.x * sx, y: point.handleOut.y * sy} : undefined,
        };
    }

    private _findNearestSegment(points: LinkPoint[], point: { x: number; y: number }): number {
        let minDistance = Number.POSITIVE_INFINITY;
        let nearestIndex = 0;

        for (let i = 0; i < points.length - 1; i += 1) {
            const a = points[i];
            const b = points[i + 1];
            const distance = this._distancePointToSegment(point, a, b);
            if (distance < minDistance) {
                minDistance = distance;
                nearestIndex = i;
            }
        }

        return nearestIndex;
    }

    private _distancePointToSegment(point: { x: number; y: number }, a: LinkPoint, b: LinkPoint): number {
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        if (dx === 0 && dy === 0) {
            return Math.hypot(point.x - a.x, point.y - a.y);
        }

        const t = ((point.x - a.x) * dx + (point.y - a.y) * dy) / (dx * dx + dy * dy);
        const clamped = Math.max(0, Math.min(1, t));
        const projX = a.x + clamped * dx;
        const projY = a.y + clamped * dy;
        return Math.hypot(point.x - projX, point.y - projY);
    }

    private _getBlockIdFromEvent(e: Event): string | null {
        const path = e.composedPath() as EventTarget[];
        for (const node of path) {
            if (!(node instanceof HTMLElement)) continue;
            const blockId = node.getAttribute('block-id');
            if (blockId) return blockId;
        }
        return null;
    }

    private _isEditingActive(blockId: string): boolean {
        return Boolean(this.state.enabled && this.state.activeLinkId === blockId);
    }

    private _getActiveLinkElement(): HTMLElement | null | undefined {
        if (!this.activeLinkId) return null;
        return this.documentModel.getElement(this.activeLinkId);
    }

    private _clampOffset(value: number): number {
        if (Number.isNaN(value)) return 0;
        return Math.max(-100, Math.min(100, value));
    }

    private _generateLinkPointId(): string {
        return `lp-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    }
}

export const linkModeControllerContext = createContext<LinkModeController>('link-mode-controller');
