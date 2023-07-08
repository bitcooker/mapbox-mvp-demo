export default interface Property {
    id?: string;
    quadkey: string;
    color: string;
    comment: string;
    uidUser: string;
    displayName: string;
    photoURL: string;
    createdAt: Date;
    updatedAt: Date | null;
}