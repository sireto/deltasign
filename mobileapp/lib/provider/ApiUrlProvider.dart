import 'package:flutter/material.dart';

class ApiUrlProvider with ChangeNotifier {
  // String _apiUri = "https://deltasign.sireto.io";
  String _apiUri = "http://192.168.0.247:8000";
  String get apiuri => _apiUri;
  void setApiUri(String apiUri) {
    _apiUri = apiUri;
    notifyListeners();
  }
}
