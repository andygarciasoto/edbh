
export function getTagParameters(params: any): any[] {
    let parameters: any[] = [];
    if (params.tag_id)
        parameters.push('T.tag_id = ' + params.tag_id);
    if (params.site_id)
        parameters.push('T.site_id = ' + params.site_id);
    if (params.status && params.status !== 'All')
        parameters.push(`T.status = '${params.status}'`);
    return parameters;
}