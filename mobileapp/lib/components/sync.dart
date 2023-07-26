// import 'package:delta_sign/database/document_operation.dart';
// import 'package:delta_sign/database/server_operation.dart';
// import 'package:delta_sign/models/user_model.dart';
// import 'package:dio/dio.dart';
// import 'package:get_it/get_it.dart';

// class Sync {
//   UserModel _userModel = GetIt.I.get();
//   Dio dio = new Dio();
//   DocumentOperation _dbOperation = DocumentOperation();
//   ServerOp _serverOp;
//   Sync() {
//     _serverOp = ServerOp(apiKey: _userModel.apiKey);
//   }
//   Future syncToServer() async {
//     bool isSynced = false;
//     List documents = await _dbOperation.getAll();
//     for (int i = 0; i < documents.length; i++) {
//       if (documents[i].uuid == null) {
//         isSynced = true;
//         await _serverOp.uploadDoc(filePath: documents[i].filePath);
//       }
//     }
//     return isSynced;
//   }
// }
