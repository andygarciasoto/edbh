
export function getUOMParameters(params: any): any[] {
    let parameters: any[] = [];
    if (params.uom_id)
        parameters.push('U.UOM_id = ' + params.uom_id);
    if (params.site_id)
        parameters.push('U.site_id = ' + params.site_id);
    if (params.status && params.status !== 'All')
        parameters.push(`U.status = '${params.status}'`);
    return parameters;
}