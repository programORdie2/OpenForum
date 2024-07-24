function serialize(text: string) {
    const entitiyMap: { [key: string]: string } = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
        '/': '&#x2F;',
        '`': '&#x60;',
        '=': '&#x3D;',
    }

    const regex = /[&<>"'/`=]/g
    return text.replace(regex, (s) => entitiyMap[s])
}

export default serialize