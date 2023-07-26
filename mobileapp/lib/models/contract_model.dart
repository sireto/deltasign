import 'dart:convert';

class ContractModel {
  int _id;
  String _uuid;
  Map _document;
  String _message;
  String _createdDate;
  bool send;
  String _signedDocUrl;
  List _annotations;
  String _filePath;
  List _signers;
  int _signednumber;
  bool _isSigned;
  String _name;
  ContractModel(
      {int id,
      String uuid,
      Map document,
      String message,
      List annotations,
      String createdDate,
      String signedDocUrl,
      this.send,
      int signedNumber,
      String filePath,
      bool isSigned,
      String name,
      List signers}) {
    _id = id;
    _uuid = uuid;
    _document = document;
    _createdDate = createdDate;
    _message = message;
    _annotations = annotations;
    _signers = signers;
    _signedDocUrl = signedDocUrl;
    _filePath = filePath;
    _isSigned = isSigned;
    _signednumber = signedNumber;
    _name = name;
  }
  int get id {
    return _id;
  }

  int get signedNumber {
    return _signednumber;
  }

  String get contractName {
    return _name;
  }

  String get uuid {
    return _uuid;
  }

  bool get isContractSigned {
    return _isSigned;
  }

  Map get document {
    return _document;
  }

  String get signDocUrl {
    return _signedDocUrl;
  }

  String get filePath => _filePath;

  set filePath(String value) {
    _filePath = value;
  }

  List get signers => _signers;
  List get annotations => _annotations;
  String get message => _message;
  String get createdDate => _createdDate;
  set id(int value) {
    _id = value;
  }

  set annotations(List value) {
    _annotations = value;
  }

  set signers(List value) {
    _signers = value;
  }

  factory ContractModel.fromMap({int id, var map}) => ContractModel(
      id: id,
      uuid: map['uuid'],
      document: map['document'],
      message: map['message'],
      name: map['name'],
      createdDate: map['created_date'],
      signers: map['signers'],
      annotations: map['annotations'],
      filePath: map['filePath'],
      signedDocUrl: map['signed_doc_url'],
      signedNumber: map["signed_number"],
      isSigned: map["isSigned"] ?? false,
      send: map['send']);

  Map<String, dynamic> toMap() => {
        'id': _id,
        'uuid': _uuid,
        'name': _name,
        'document': _document,
        'message': _message,
        'signers': _signers,
        'created_date': _createdDate,
        'annotations': _annotations,
        'filePath': _filePath,
        'signed_doc_url': _signedDocUrl,
        'signedNumber': _signednumber,
        'isSigned': _isSigned,
        'send': send
      };
  // {uuid: 705e2abd-dd4f-45d0-b0d1-fec49bbf40ae,
  //  document: {uuid: 905ced53-9046-4811-8dce-c34c79f11a9d, filename: ALL Drawing Solution 1st sem.pdf, file_hash: ae8e9102f2526d0bc49d1c13cf4cf561073343e87b61a374d3d46ecba015b21a, s3_url: https://s3.eu-central-1.wasabisys.com/eu.delta.sireto.io/pdf/bbcba2b5-1bac-4535-b6cd-a54b123a45a6/ae8e9102f2526d0bc49d1c13cf4cf561073343e87b61a374d3d46ecba015b21a.pdf, properties: {"width": 612.0, "height": 792.0}, created_date: 2021-07-21T05:49:03.521085, updated_date: 2021-07-21T05:49:03.521097, owner_uuid: bbcba2b5-1bac-4535-b6cd-a54b123a45a6},
  //   message: drawing, created_date: 2021-07-21T05:50:47.386570, status: NEW, signers: [nabin.kawan.9@gmail.com], annotations: [{x1: 495.19990007267455, y1: 77.90592028135956, x2: 592.6619829847069, y2: 110.40298944900317, signer: nabin.kawan.9@gmail.com, page: 1, color: #9e9e9e}]}
}
