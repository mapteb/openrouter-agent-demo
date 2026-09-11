export function shippingCalc(locn: string): number {
    switch (locn.toLowerCase()) {
        case "chennai":
            return 8.00;
        case "bangalore":
        case "bengaluru":
            return 10.00;
        default:
            return 0; // or throw an error
    }
}