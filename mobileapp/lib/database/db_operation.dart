import 'package:delta_sign/models/document_model.dart';

abstract class DbOperation {
  // adds single document/ contract to db
  Future add(var documentModel, bool send);

  // deletes the document/ contract
  Future delete(var documentModel);

  // update document /contract
  Future update(var documentModel);

  // returns all documents/ contracts
  Future<List> getAll();

  // returns document/ contract of the specific id
  Future get(int id);

  // function to check whether the document/ contract exist in db or not
  Future contain(var documentModel);

  // deletes all documents / contracts in db
  Future deleteAll();

  // adds all documents/ contracts to db
  Future addAll(List<Map<String, dynamic>> documents);
}
