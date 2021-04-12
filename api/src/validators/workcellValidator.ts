
export function getWorkcellParameters(params: any): any[] {
    let parameters: any[] = [];
    if (params.site_id)
        parameters.push('W.site_id = ' + params.site_id);
    if (params.workcell_id)
        parameters.push('W.workcell_id = ' + params.workcell_id);
    if (params.status && params.status !== 'All')
        parameters.push(`W.status = '${params.status}'`);
    return parameters;
}