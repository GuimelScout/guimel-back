export function generatePassword(name: string) : string {
    const firstTwoLetters = name.substring(0, 2).toUpperCase();
    const year = new Date().getFullYear();
    return `${process.env.KEY_PASS ?? ""}${year}${firstTwoLetters}`;
}
