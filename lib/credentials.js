module.exports = {
    USER_AGENT: "jslave",
    SCOPE: "read:user user:email public_repo repo:invite gist",
    CLIENT_ID: process.env['GITHUB_CLIENT_ID'] || process.env['GITHUB_JSLAVE_CLIENT_ID'] || '', 
    CLIENT_SECRET: process.env['GITHUB_CLIENT_SECRET'] || process.env['GITHUB_JSLAVE_CLIENT_SECRET'] || ''
}