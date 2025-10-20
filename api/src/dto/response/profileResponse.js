// Profile Response DTO
class ProfileResponse {
  constructor(data) {
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.email = data.email;
    this.avatar = data.avatar;
    this.phone = data.phone;
    this.address = data.address;
  }

  static fromUser(user) {
    return new ProfileResponse({
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      avatar: user.avatar,
      phone: user.phone,
      address: user.address,
    });
  }
}

// Avatar Response DTO
class AvatarResponse {
  constructor(data) {
    this.avatar = data.avatar;
  }

  static fromUser(user) {
    return new AvatarResponse({
      avatar: user.avatar,
    });
  }
}

module.exports = {
  ProfileResponse,
  AvatarResponse,
};
