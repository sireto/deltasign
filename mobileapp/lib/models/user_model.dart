import 'dart:convert';

import 'package:get_it/get_it.dart';
import 'package:shared_preferences/shared_preferences.dart';

class UserModel {
  String _uuid;
  String _email;
  String _fullName;
  String _apiKey;
  String _imagePath;

  UserModel(
      {String uuid,
      String email,
      String fullName,
      String imagePath,
      String apiKey}) {
    _uuid = uuid;
    _email = email;
    _fullName = fullName;
    _imagePath = imagePath;
    _apiKey = apiKey;
  }
  String get uuid {
    return _uuid;
  }

  String get email {
    return _email;
  }

  String get fullName {
    return _fullName;
  }

  set fullName(value) {
    _fullName = value;
  }

  String get imagePath {
    return _imagePath;
  }

  set imagePath(value) {
    _imagePath = value;
  }

  String get apiKey {
    return _apiKey;
  }

  //saves user profile to local
  Future setProfile({Map<String, dynamic> map}) async {
    UserModel userModel = UserModel(
      uuid: map['uuid'],
      email: map['email'],
      // fullName: map['full_name'],
      // imageUrl: map['_imageUrl'],
      apiKey: map['api_key'],
    );
    final pref = await SharedPreferences.getInstance();
    pref.setString('userModel', jsonEncode(userModel.toMap()));
    print("user map");
    print(userModel.toMap());

    if (GetIt.I.isRegistered<UserModel>()) {
      GetIt.I.unregister<UserModel>();
    }
    GetIt.I.registerSingleton<UserModel>(userModel);
    return userModel;
  }

  // updates user profile to local
  Future updateProfile({
    String fullName,
    String imagePath,
  }) async {
    UserModel userModel = UserModel(
        uuid: _uuid,
        email: email != null ? email : _email,
        fullName: fullName != null ? fullName : _fullName,
        imagePath: imagePath != null ? imagePath : _imagePath,
        apiKey: _apiKey);
    final pref = await SharedPreferences.getInstance();
    pref.setString('userModel', jsonEncode(userModel.toMap()));
    GetIt.I.unregister<UserModel>();
    GetIt.I.registerSingleton<UserModel>(userModel);
  }

  // delete user profile
  Future delete() async {
    final pref = await SharedPreferences.getInstance();
    pref.remove('userModel');
    GetIt.I.unregister<UserModel>();
  }

  // converts map into object
  factory UserModel.fromMap(Map<String, dynamic> map) => UserModel(
        uuid: map['uuid'],
        email: map['email'],
        fullName: map['full_name'],
        imagePath: map['imagePath'],
        apiKey: map['api_key'],
      );

// converts object in map
  Map<String, dynamic> toMap() => {
        "uuid": _uuid,
        "email": _email,
        "full_name": _fullName,
        // "image"
        "imagePath": _imagePath,
        "api_key": _apiKey,
      };
}
