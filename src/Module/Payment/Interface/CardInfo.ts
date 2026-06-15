export interface ICardInfo {
    userId: string ,
    card_number: string,
    card_expiry_month: string,
    card_expiry_year: string,
    card_cvv: string
}

export interface ICardObject {
    status: string,
    message: string,
    data: {
        type: string,
        card: {
            expiry_month: number,
            expiry_year: number,
            first6: string | number,
            lasr4: string | number,
            network: string
        },
        id: string,
        meta: object,
        created_dateTine: string | Date
    }
}