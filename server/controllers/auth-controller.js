const hashService = require("../services/hash-service");
const otpService = require("../services/otp-service");

class AuthController {
  async sendOtp(req, res) {
    const { phone } = req.body;
    if (!phone) {
      res.status(400).json({ message: "Phone Feilds is required" });
    }

    const otp = await otpService.generateOtp();
    const ttl = 1000 * 60 * 2; // 2 Min for the OTP
    const expires = Date.now() + ttl;
    const data = `${phone}.${otp}.${expires}`;
    const hash = hashService.hashOtp(data);

    try {
      await otpService.sendBySms(phone, otp);
      return res.json({
        hash: `${hash}.${expires}`,
        phone,
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "message sending failed" });
    }
  }

  verifyOtp(req, res) {
    const { otp, phone } = req.body;
    if (!otp || !hash || !phone) {
      res.status(400).json({ message: "All feilds are required" });
    }

    const [hashedOtp, expires] = hash.split(".");
    if (Date.now() > expires) {
      res.status(400).json({ message: "OTP expired" });
    }

    const data = `${phone}.${otp}.${expires}`;
    const isValid = otpService.verifyOtp(hashedOtp, data)
    if (!isValid) {
      res.status(400).json({ message : "Invalid OTP entered"})
    }

    let user ;
    let accessToken;
    let refreshToken;
  }
}

module.exports = new AuthController();