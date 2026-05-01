//---------- Generate 5-digit verification code ----------

exports.generateVerificationCode = () => {
    const code = Math.floor(10000 + Math.random() * 90000).toString();
    const expires = Date.now() + 5 * 60 * 1000; // 5 minutes expiry
    return { code, expires };
}
