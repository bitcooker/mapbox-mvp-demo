export default interface Comment {
    id?: string;
    quadkey: string;
    comment: string;
    uidUser: string;
    createdAt: Date;
    updatedAt: Date | null;
}