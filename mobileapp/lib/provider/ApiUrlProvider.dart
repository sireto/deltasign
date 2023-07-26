import 'package:flutter/material.dart';

class ApiUrlProvider with ChangeNotifier {
//   String _apiUri = "https://dev-delta-api.cnftregistry.io/";
  String _apiUri = "http://10.0.2.2:8000";
  String get apiuri => _apiUri;
  void setApiUri(String apiUri) {
    _apiUri = apiUri;
    notifyListeners();
  }
}
