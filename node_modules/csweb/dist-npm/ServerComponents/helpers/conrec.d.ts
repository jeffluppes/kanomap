export interface IGenericPoint<T> {
    x: T;
    y: T;
}
export interface IPoint extends IGenericPoint<number> {
}
export interface ILinkedList<T> {
    head?: ILinkedList<T>;
    tail?: ILinkedList<T>;
    next?: ILinkedList<T>;
    prev?: ILinkedList<T>;
    p?: IGenericPoint<T>;
}
export interface ILinkedPointList extends ILinkedList<number> {
    closed?: boolean;
}
export interface IDrawContour {
    (startX: number, startY: number, endX: number, endY: number, contourLevel: number, k: number): void;
}
export declare class Conrec {
    private h;
    private sh;
    private xh;
    private yh;
    private contours;
    constructor(drawContour?: IDrawContour);
    contour(d: number[][], ilb: number, iub: number, jlb: number, jub: number, x: number[], y: number[], nc: number, z: number[], noDataValue?: number): void;
    private drawContour(startX, startY, endX, endY, contourLevel, k);
    contourList: IContourList;
}
export interface IContour extends Array<{
    x: number;
    y: number;
}> {
    k: number;
    level: number;
}
export interface IContourList extends Array<IContour> {
}
