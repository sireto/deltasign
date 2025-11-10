import 'package:delta_sign/database/contract_operation.dart';
import 'package:delta_sign/database/document_operation.dart';
import 'package:delta_sign/models/contract_model.dart';
import 'package:delta_sign/models/document_model.dart';
import 'package:delta_sign/provider/ApiUrlProvider.dart';
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:get_it/get_it.dart';
import 'package:http_parser/http_parser.dart';

import 'package:path/path.dart';
import 'dart:io';

import 'package:provider/provider.dart';

class ServerOp {
  Dio dio = new Dio();
  String _uuid;

  ContractOperation _dbContractOp = ContractOperation();
  // user apiKey
  String _apiKey;
  BuildContext _context;
  Directory _appDir = GetIt.I.get();
  // ContractModel _contractModel = GetIt.I.get();
  ApiUrlProvider apiUrlProvider;
  ServerOp(
      {@required String apiKey, String uuid, @required BuildContext context}) {
    _apiKey = apiKey;
    _uuid = uuid;
    _context = context;
  }

  DocumentOperation _dbDocumentOp = DocumentOperation();
  // upload document(pdf) to server and local
  Future uploadDoc({int id, String filePath}) async {
    apiUrlProvider = Provider.of<ApiUrlProvider>(_context, listen: false);
    try {
      String url = "${apiUrlProvider.apiuri}/documents";
      var headers = {
        'accept': 'application/json',
        'api-key': '$_apiKey',
        'Content-Type': 'multipart/form-data'
      };

      String filename = filePath.split('/').last.replaceAll("'", "");
      FormData formData = new FormData.fromMap({
        "file": await MultipartFile.fromFile(
          filePath,
          filename: filename,
          contentType: MediaType('application', 'pdf'),
        ),
        "type": 'application/pdf'
      });
      Response response = await dio.post(url,
          data: formData,
          options: Options(
            headers: headers,
          ));
      if (response.statusCode == 200) {
        print("from server ${response.data}");
        // Fluttertoast.showToast(
        //     msg: "file uploaded",
        //     toastLength: Toast.LENGTH_SHORT,
        //     gravity: ToastGravity.BOTTOM);
        DocumentModel documentModel = DocumentModel.fromMap(map: response.data);
        // adding to local

        documentModel.filePath = filePath;

        int id = await _dbDocumentOp.add(documentModel, true);
        documentModel.id = id;
        print("doc uuid ${documentModel.uuid}");
        return documentModel;
      } else {
        print("error");
      }
    } on DioError catch (e) {
      print(e);
      if (e.response != null) {
        print("document already contain");
      }
    } catch (e) {
      print("caught error  $e");
    }
  }

  // update document in server
  Future renameDoc({String uuid, String name}) async {
    apiUrlProvider = Provider.of<ApiUrlProvider>(_context, listen: false);
    try {
      String url = "${apiUrlProvider.apiuri}/documents/";
      var headers = {
        'accept': 'application/json',
        'api-key': '$_apiKey',
        'Content-Type': 'application/json'
      };

      Response response = await dio.patch(url + uuid.trim(),
          data: {'name': name},
          options: Options(
            headers: headers,
          ));

      if (response.statusCode == 200) {
        print(response.data);
        return "updated";
      } else {
        print("error");
      }
    } on DioError catch (e) {
      if (e.response != null) {
        print(e.response.statusCode);
        print(e.response.statusMessage);
        print("failed");
      }
    } catch (e) {
      print("caught error  $e");
    }
  }

  // getAll doments(pdf) from server
  Future getAllDoc({String purpose = 'get'}) async {
    apiUrlProvider = Provider.of<ApiUrlProvider>(_context, listen: false);
    print("api ${apiUrlProvider.apiuri}");
    print(_apiKey);
    var uri = "${apiUrlProvider.apiuri}/documents";
    var headers = {
      'accept': 'application/json',
      'api-key': '$_apiKey',
    };
    try {
      var response = await dio.get(uri,
          options: Options(
            headers: headers,
          ));
      if (response.statusCode == 200) {
        print(response.data.runtimeType);
        var datas = response.data;
        if (purpose == 'get') {
          for (int i = 0; i < datas.length; i++) {
            String url = datas[i]['s3_url'];

            //print(file.path);
            datas[i]['filePath'] = '${_appDir.path}/${basename(url)}';

            downloadDocument(url);
            //'/data/user/0/com.example.delta_sign/app_flutter/ae8e9102f2526d0bc49d1c13cf4cf561073343e87b61a374d3d46ecba015b21a.pdf';
          }
          // List finalDatas = [];
          // datas.forEach((element) async {
          //   File file = await downloadDocument(element['s3_url']);
          //   element['filePath'] = file.path;
          //   finalDatas.add(element);
          // });
          await _dbDocumentOp.addAll(datas);
          List<DocumentModel> documents = await _dbDocumentOp.getAll();
          // documents.forEach((element) async {
          //   if (element.filePath == null) {
          //     File file = await downloadDocument(element.pdfLink);
          //     element.filePath = file.path;
          //   }
          // });
          if (GetIt.I.isRegistered<List<DocumentModel>>()) {
            GetIt.I.unregister<List<DocumentModel>>();
          }

          GetIt.I.registerSingleton<List<DocumentModel>>(documents);
          print("documents fetched");
          return documents;
        } else if (purpose == 'sync') {
          return datas;
        }
      }
    } on DioError catch (e) {
      print(e.response);
      if (e.response != null) {
        print("failed");
      }
    }
  }

  // delete document from server as well as from local
  Future deleteDoc(DocumentModel document) async {
    apiUrlProvider = Provider.of<ApiUrlProvider>(_context, listen: false);
    print(document.toMap());
    print(_apiKey);
    try {
      String url = "${apiUrlProvider.apiuri}/documents/";

      var headers = {
        'accept': 'application/json',
        'api-key': '$_apiKey',
      };
      print(document.uuid);

      Response response = await dio.delete(url + document.uuid.trim(),
          options: Options(
            headers: headers,
          ));
      print(response.statusCode);
      if (response.statusCode == 200) {
        print(response.data);
        await _dbDocumentOp.delete(document);
        print("done");

        return {"deleted":true , "message":"Deleted Successfully"};
      } else {
        print("error");
        return {"deleted":false, "message" : response.data["detail"].toString()};
      }
    } on DioError catch (e) {
      print(e.response.statusCode);
      print(e.response.statusMessage);
      print(e.response);
      if (e.response != null) {
        print("failed");
        return {"deleted":false, "message" : e.response.data["detail"].toString()};
      }
    } catch (e) {
      print("caught error  $e");
      return {"deleted":false, "message" : "unknown issue"};
    }
  }

  // download pdf returns file
  Future downloadDocument(String url) async {
    print("downloading.. $url");
    final response = await dio.get(url,
        options: Options(
          responseType: ResponseType.bytes,
        ));
    final bytes = response.data;

    return storeFile(url, bytes);
  }

  // store file
  Future storeFile(String url, List<int> bytes) async {
    final filename = basename(url);
    final file = File('${_appDir.path}/$filename');
    await file.writeAsBytes(bytes, flush: true);
    return file;
  }

  Future sendContract(String uuid, Set email, List annotation, String message,
      String filePath, String contractName) async {
    apiUrlProvider = Provider.of<ApiUrlProvider>(_context, listen: false);
    try {
      var uri = "${apiUrlProvider.apiuri}/contracts";
      var headers = {
        'accept': 'application/json',
        'api-key': '$_apiKey',
        'Content-Type': 'application/json'
      };
      // print(annotationn.emaill);
      //print(annotationn.value());
      var data = {
        "document_uuid": uuid,
        "name": contractName,
        "message": message,
        "signers": email.toList(),
        "annotations": annotation,
      };
      var response =
          await dio.post(uri, data: data, options: Options(headers: headers));
      if (response.statusCode == 200) {
        print("response from server");
        print(response.data);
        response.data['filePath'] = filePath;
        response.data['signed_number'] = 0;
        response.data['isSigned'] = false;
        await _dbContractOp.add(response.data, true);
        return true;
      }
      print(response.data);
    } catch (e) {
      print(e);
    }
  }

  //getContracts on the basis of send and receive
  Future getContract(
      {bool sent = false,
      bool received = false,
      String purpose = 'get'}) async {
    apiUrlProvider = Provider.of<ApiUrlProvider>(_context, listen: false);
    try {
      String url = "${apiUrlProvider.apiuri}/users/{uuid}";
      var headers = {
        'accept': 'application/json',
        'api-key': '$_apiKey',
      };

      Response response =
          await dio.get(url + '/contracts?sent=$sent&received=$received',
              options: Options(
                headers: headers,
              ));
      print(response.statusCode);
      if (response.statusCode == 200) {
        // _dbContractOp.delete(documentModel)
        List datas = response.data;

        if (purpose == "get") {
          for (int i = 0; i < datas.length; i++) {
            String url = datas[i]['signed_doc_url'];
            if (datas[i]['uuid'] != null)

              //print(file.path);
              datas[i]['filePath'] = '${_appDir.path}/${basename(url)}';
            datas[i]['send'] = sent;
            downloadDocument(url);
            // File file = await downloadDocument(datas[i]['document']['s3_url']);
            // datas[i]['filePath'] = file.path;
            // datas[i]['send'] = sent;
          }
          // datas.forEach((element) async {
          //   File file = await downloadDocument(element['document']['s3_url']);
          //   element['filePath'] = file.path;
          //   element['send'] = sent;
          // });
          // print(datas[0]['filePath']);

          // await _dbContractOp.addAll(datas);
          // List<ContractModel> contracts = await _dbContractOp.getAll();
          // if (datas.isNotEmpty) {
          //   contracts = contracts.reversed.toList();
          // }
          // if (GetIt.I.isRegistered<List<ContractModel>>()) {
          //   GetIt.I.unregister<List<ContractModel>>();
          // }
          // GetIt.I.registerSingleton<List<ContractModel>>(contracts);
          // print("done");
          // print("contracts fetched");
          // print(contracts);
          return datas;
        } else {
          for (int i = 0; i < datas.length; i++) {
            datas[i]['send'] = sent;
          }
          return datas;
        }
      } else {
        print("error");
      }
    } on DioError catch (e) {
      print(e.response.statusCode);
      print(e.response.statusMessage);
      print(e.response);
      if (e.response != null) {
        print("failed");
      }
    } catch (e) {
      print("caught error  $e");
    }
  }

  Future getContractByUuid({
    @required String uuid,
    @required bool sent,
    @required ContractModel contractModel,
  }) async {
    apiUrlProvider = Provider.of<ApiUrlProvider>(_context, listen: false);
    try {
      String url = "${apiUrlProvider.apiuri}/contracts/";
      var headers = {
        'accept': 'application/json',
        'api-key': '$_apiKey',
      };

      Response response = await dio.get(url + uuid.trim(),
          options: Options(
            headers: headers,
          ));
      print(response.statusCode);
      if (response.statusCode == 200) {
        // _dbContractOp.delete(contractModel);

        var datas = response.data;
        String url = datas['signed_doc_url'];

        //print(file.path);
        datas['filePath'] = '${_appDir.path}/${basename(url)}';
        downloadDocument(url);
        print("text $sent");
        // File file = await downloadDocument(datas[i]['document']['s3_url']);
        // datas[i]['filePath'] = file.path;
        datas['send'] = sent;
        datas['isSigned'] = true;
        // datas.forEach((element) async {
        //   File file = await downloadDocument(element['document']['s3_url']);
        //   element['filePath'] = file.path;
        //   element['send'] = sent;
        // });
        ContractModel _contractModel;
        _contractModel =
            ContractModel.fromMap(id: contractModel.id, map: datas);

        await _dbContractOp.update(_contractModel);
        // await _dbContractOp.add(datas, sent);
        List<ContractModel> contracts = await _dbContractOp.getAll();
        if (datas.isNotEmpty) {
          contracts = contracts.reversed.toList();
        }
        if (GetIt.I.isRegistered<List<ContractModel>>()) {
          GetIt.I.unregister<List<ContractModel>>();
        }
        GetIt.I.registerSingleton<List<ContractModel>>(contracts);
        print("done");
        print("contracts fetched");
        print(contracts);
        return contracts;
        // } else {
        //   for (int i = 0; i < datas.length; i++) {
        //     datas[i]['send'] = sent;
        //   }
        //   return datas;
        // }
      } else {
        print("error");
        return null;
      }
    } on DioError catch (e) {
      print(e.response.statusCode);
      print(e.response.statusMessage);
      print(e.response);
      if (e.response != null) {
        print("failed");
      }
    } catch (e) {
      print("caught error  $e");
    }
    return null;
  }

  Future sign(String filePath, String uuid) async {
    apiUrlProvider = Provider.of<ApiUrlProvider>(_context, listen: false);
    try {
      var uri = "${apiUrlProvider.apiuri}/contracts/";
      var headers = {
        'accept': 'application/json',
        'api-key': '$_apiKey',
        'Content-Type': 'multipart/form-data'
      };
      String filename = filePath.split('/').last;
      FormData formData = new FormData.fromMap({
        "file": await MultipartFile.fromFile(
          filePath,
          filename: filename,
          contentType: MediaType('image', 'png'),
        ),
        "type": 'image/png'
      });
      var response = await dio.post(uri + uuid + "/sign",
          data: formData,
          options: Options(
            headers: headers,
          ));
      print(response.data);
      return response.data;
    } catch (e) {
      print(e);
    }
  }
}
