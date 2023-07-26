import 'dart:convert';
import 'dart:io';

import 'package:delta_sign/database/contract_operation.dart';
import 'package:delta_sign/database/document_operation.dart';
import 'package:delta_sign/models/contract_model.dart';
import 'package:delta_sign/models/document_model.dart';
import 'package:delta_sign/models/user_model.dart';
import 'package:path/path.dart';
import 'package:get_it/get_it.dart';
import 'package:path_provider/path_provider.dart';

import 'package:sembast/sembast.dart';
import 'package:sembast/sembast_io.dart';
import 'package:shared_preferences/shared_preferences.dart';

class Init {
  static Future initialize() async {
    await _initialize();
  }

  static Future _initialize() async {
    Directory appDir = await getApplicationDocumentsDirectory();

    await appDir.create(recursive: true);

    //creates a database path as ../art_manager.db
    final databasePath = join(appDir.path, "deltasign.db");
    final database = await databaseFactoryIo.openDatabase(databasePath);
    //register instance of Database for future use
    GetIt.I.registerSingleton<Database>(database);
    GetIt.I.registerSingleton<Directory>(appDir);
    // checking user profile in local
    final pref = await SharedPreferences.getInstance();
    var userData = pref.getString('userModel');
    // print(userData);
    UserModel userModel;
    if (userData != null) {
      userModel = UserModel.fromMap(jsonDecode(userData));
      GetIt.I.registerSingleton<UserModel>(userModel);
    }
    DocumentOperation dbDocumentOp = DocumentOperation();
    ContractOperation dbContractOp = ContractOperation();
    //     DocumentOperation(storeName: 'contract_store');
//fetching datas from server
    // if (GetIt.I.isRegistered<List<DocumentModel>>()) {
    //   try {
    //     print("fetching datas from server");
    //     List documentDatas =
    //         await ServerOp(apiKey: userModel.apiKey).getAllDoc();
    //     await dbOperation.addAll(documentDatas);
    //   } catch (e) {
    //     print("fetching data failed");
    //   }
    // }
    //fetching datas from local
    // if (GetIt.I.isRegistered<List<DocumentModel>>()) {
    //   GetIt.I.unregister<List<DocumentModel>>();
    // }
    List<DocumentModel> documents = await dbDocumentOp.getAll();
    List<ContractModel> contracts = await dbContractOp.getAll();
    documents = documents.reversed.toList();
    // contracts = contracts.reversed.toList();
    print("documents:$documents");
    print("contracts: $contracts");
    GetIt.I.registerSingleton<List<DocumentModel>>(documents);
    GetIt.I.registerSingleton<List<ContractModel>>(contracts);
  }
}
