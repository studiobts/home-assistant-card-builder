function parseVersionParts(version: string): number[] {
    const matches = version.match(/\d+/g);
    if (!matches) return [];
    return matches
        .map((part) => Number.parseInt(part, 10))
        .filter((value) => Number.isFinite(value));
}

export function compareVersions(left: string, right: string): number {
    const leftParts = parseVersionParts(left);
    const rightParts = parseVersionParts(right);
    const maxLength = Math.max(leftParts.length, rightParts.length, 1);

    for (let index = 0; index < maxLength; index += 1) {
        const leftValue = leftParts[index] ?? 0;
        const rightValue = rightParts[index] ?? 0;
        if (leftValue > rightValue) return 1;
        if (leftValue < rightValue) return -1;
    }

    return 0;
}

export function isValidSemver(version: string): boolean {
    return /^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/.test(version);
}
