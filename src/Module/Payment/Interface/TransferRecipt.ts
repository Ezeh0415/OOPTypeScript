export interface IBank {
    account_number: number,
    code: number,
}

export interface IRecipient {
    status: string;
    message: string;
    data: {
        type: string,
        id: string,
        name: {
            first: string,
            last: string,
        },
        currency: string,
        bank: {
            account_number: number,
            code: number,
        }
    };
    traceId:string;
    IdempotencyKey:string;
}