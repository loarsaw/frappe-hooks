import { IListingBuilder } from "../types"

export function listingBuilder(url: string, data: IListingBuilder) {
    console.log(data.f_array)
    let a_url;
    if (data.limit_page_length) {
        a_url = `${url}?limit_page_length=${String(data.limit_page_length)}`
    } if (data.limit_start) {
        a_url = `${url}?limit_start=${String(data.limit_start)}`
    } if (data.f_array && data.f_array?.length >= 0) {
        const encodedFields = encodeURIComponent(JSON.stringify(data.f_array))
        a_url = `${a_url}&fields=${encodedFields}`
    } else {
        a_url = url
    }
    return a_url
}
