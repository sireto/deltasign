import 'package:delta_sign/database/db_operation.dart';
import 'package:delta_sign/models/contract_model.dart';
import 'package:delta_sign/models/document_model.dart';
import 'package:flutter/material.dart';
import 'package:get_it/get_it.dart';
import 'package:sembast/sembast.dart';

class DocumentOperation extends DbOperation {
  String storeName;
  final Database _db = GetIt.I.get();
  StoreRef _store =
      intMapStoreFactory.store('document_store'); // store reference in db

  // adds all documents/ contracts to db
  @override
  Future addAll(List documents) async {
    await _store.addAll(_db, documents);
  }

  // adds single document/ contract to db
  @override
  Future add(documentModel, send) async {
    var result = await _store.add(_db, documentModel.toMap());
    // documentModel.id = result;

    // List<DocumentModel> documents = GetIt.I.get();
    // documents.insert(0, documentModel);
    // GetIt.I.unregister<List<DocumentModel>>();
    // GetIt.I.registerSingleton<List<DocumentModel>>(documents);

    return result;
  }

  // function to check whether the document/ contract exist in db or not
  @override
  Future contain(documentModel) async {
    List documents = await getAll();
    documents = documents.map((e) => e.fileName.toLowerCase()).toList();
    if (documents.contains(documentModel.fileName.toLowerCase())) {
      return true;
    } else {
      return false;
    }
  }

  // deletes the document/ contract
  @override
  Future delete(documentModel) async {
    if (documentModel.id != null) {
      var result = await _store.record(documentModel.id).delete(_db);
      if (result != null) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  // deletes all documents / contracts in db
  @override
  Future deleteAll() async {
    await _store.drop(_db);
  }

  // returns document/ contract of the specific id
  @override
  Future get(int id) async {
    var data = await _store.record(id).get(_db);
    return DocumentModel.fromMap(id: id, map: data);
  }

  // returns all documents/ contracts
  @override
  Future<List> getAll() async {
    final snapshots = await _store.find(_db);
    return snapshots
        .map((snapshot) =>
            DocumentModel.fromMap(id: snapshot.key, map: snapshot.value))
        .toList();
    //  return [];
  }

  // update document /contract
  @override
  Future update(documentModel) async {
    print(documentModel.id);
    await _store.record(documentModel.id).update(_db, documentModel.toMap());
    List<DocumentModel> documents = await getAll();
    documents = documents.reversed.toList();
    GetIt.I.unregister<List<DocumentModel>>();
    GetIt.I.registerSingleton<List<DocumentModel>>(documents);
  }
}
