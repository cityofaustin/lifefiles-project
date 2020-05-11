class Util {
  static hasAllRequiredKeys() {
    if (
      process.env.AUTH_SECRET !== undefined &&
      process.env.ADMIN_PASSWORD !== undefined &&
      process.env.AWS_ACCESS_KEY_ID !== undefined &&
      process.env.AWS_SECRET_KEY !== undefined &&
      process.env.AWS_DOCUMENTS_BUCKET_NAME !== undefined &&
      process.env.AWS_PROFILE_IMAGES_BUCKET_NAME !== undefined
    ) {
      return true;
    } else {
      return false;
    }
  }
}

module.exports = Util;
