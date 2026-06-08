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
    traceId: string;
    IdempotencyKey: string;
}

export interface ITransfer {
    status: string,
    message: string,
    data: {
        id: string,
        type: string,
        action: string,
        reference: string,
        status: string,
        narration: string,
        source_currency: string,
        destination_currency: string,
        amount: {
            value: number,
            applies_to: string
        },
        callback_url: string,
        recipient: {
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
        },
        meta:object,
        created_datetime: Date,
    }
}