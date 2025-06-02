import { IFilterOptions, IListingBuilder } from "../types"

export function listingBuilder(url: string, data: IListingBuilder, filters?: IFilterOptions[], isOR?: boolean) {
    let a_url;

    if (data.limit_page_length) {
        a_url = `${url}?limit_page_length=${String(data.limit_page_length)}`
    } if (data.limit_start) {
        if (data.limit_page_length) {
            if (filters && filters?.length >= 0) {
                a_url = a_url + `&limit_start=0`
            } else {
                a_url = a_url + `&limit_start=${String(data.limit_start)}`
            }
        } else {
            a_url = `${url}?limit_start=${String(data.limit_start)}`
        }
    } if (data.fieldsArray && data.fieldsArray?.length >= 0) {
        const encodedFields = encodeURIComponent(JSON.stringify(data.fieldsArray))
        if (data.limit_page_length || data.limit_start) {
            a_url = `${a_url}&fields=${encodedFields}`
        } else {
            a_url = `${url}?fields=${encodedFields}`
        }
    } else {
        a_url = url
    }
    if (filters && filters.length >= 0) {
        const p_filter = []

        for (let i = 0; i < filters.length; i++) {
            const c_filter = [];
            const filter: IFilterOptions = filters[i];
            for (const key in filter) {
                if (filter.hasOwnProperty(key)) {
                    if (key == "query") {
                        c_filter.push(filter[key])
                    }
                    if (key == "operand") {
                        if (filter.operand == "GT") {
                            c_filter.push(">")
                        } else if (filter.operand == "EQ") {
                            c_filter.push("=")
                        }
                        else if (filter.operand == "LT") {
                            c_filter.push("<")
                        } else {
                            c_filter.push("!=")

                        }
                    }
                    if (key == "value") {
                        c_filter.push(filter[key])

                    }
                }
            }
            p_filter.push(c_filter)

        }
        const encodedFields = encodeURIComponent(JSON.stringify(p_filter))
        if (data.limit_start || data.limit_page_length || (data.fieldsArray && data.fieldsArray.length >= 0)) {
            a_url = a_url + `&${isOR ? "or_filters" : "filters"}=${encodedFields}`
        } else {
            a_url = a_url + `?${isOR ? "or_filters" : "filters"}=${encodedFields}`
        }
    }
    return a_url
}
