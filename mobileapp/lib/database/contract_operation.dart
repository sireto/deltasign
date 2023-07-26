import 'package:delta_sign/database/db_operation.dart';
import 'package:delta_sign/models/contract_model.dart';
import 'package:get_it/get_it.dart';
import 'package:sembast/sembast.dart';

class ContractOperation extends DbOperation {
  String storeName;
  final Database _db = GetIt.I.get();
  StoreRef _store =
      intMapStoreFactory.store('contract_store'); // store reference in db

  @override
  Future add(map, send) async {
    ContractModel contractModel = ContractModel(
        uuid: map['uuid'],
        document: map['document'],
        name: map['name'],
        message: map['message'],
        createdDate: map['created_date'],
        signers: map['signers'],
        annotations: map['annotations'],
        filePath: map['filePath'],
        signedNumber: map["signed_number"],
        signedDocUrl: map['signed_doc_url'],
        isSigned: map['isSigned'] ?? false,
        send: send);
    var result = await _store.add(_db, contractModel.toMap());
    contractModel.id = result;
    List<ContractModel> contracts = GetIt.I.get();
    contracts.insert(0, contractModel);
    if (GetIt.I.isRegistered<List<ContractModel>>()) {
      GetIt.I.unregister<List<ContractModel>>();
    }
    GetIt.I.registerSingleton<List<ContractModel>>(contracts);
  }

  @override
  Future addAll(List documents) async {
    await _store.addAll(_db, documents);
  }

  @override
  Future contain(documentModel) {
    // TODO: implement contain
    throw UnimplementedError();
  }

  @override
  Future delete(contractModel) async {
    // TODO: implement delete
    var result = await _store.record(contractModel.id).delete(_db);
    if (result != null) {
      return true;
    } else {
      return false;
    }
  }

  @override
  Future deleteAll() async {
    await _store.drop(_db);

    // List<ContractModel> _contracts = GetIt.I.get();
    // for (int i = 0; i < _contracts.length; i++) {
    //   await _store.record(_contracts[i].id).delete(_db);
    // }
  }

  @override
  Future get(int id) {
    // TODO: implement get
    throw UnimplementedError();
  }

  @override
  Future<List> getAll() async {
    final snapshots = await _store.find(_db);
    return snapshots
        .map((snapshot) =>
            ContractModel.fromMap(id: snapshot.key, map: snapshot.value))
        .toList();
  }

  @override
  Future update(contractModel) async {
    await _store.record(contractModel.id).update(_db, contractModel.toMap());
  }
}
