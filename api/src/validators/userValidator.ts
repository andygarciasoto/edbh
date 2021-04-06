
export function getUserParameters(params: any): any[] {
    let parameters: any[] = [];
    if (params.site_id)
        parameters.push('TFD.Site = ' + params.site_id);
    if (params.badge)
        parameters.push('TFD.Badge = ' + params.badge);
    if (params.status && params.status !== 'All')
        parameters.push(`TFD.status = '${params.status}'`);
    if (params.role && params.role !== 'All')
        parameters.push(`R.name = '${params.role}'`);
    if (params.escalation && params.escalation !== 'All')
        parameters.push(`E.escalation_name = '${params.escalation}'`);
    return parameters;
}