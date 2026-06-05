export interface IBank {
    account_number: string,
    code: string,
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
            account_number: string,
            code: string,
        }
    };
    // traceId:string;
    // IdempotencyKey:string;
}