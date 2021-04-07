
export function getShiftParameters(params: any): any[] {
    let parameters: any[] = [];
    if (params.shift_id)
        parameters.push('S.shift_id = ' + params.shift_id);
    if (params.site_id)
        parameters.push('S.asset_id = ' + params.site_id);
    if (params.status && params.status !== 'All')
        parameters.push(`S.status = '${params.status}'`);
    return parameters;
}