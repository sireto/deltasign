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
  String _blockchainTxHash;

  ContractModel({
    int id,
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
    String blockchainTxHash,
    List signers,
  }) {
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
    _blockchainTxHash = blockchainTxHash;
  }

  int get id => _id;
  int get signedNumber => _signednumber;
  String get contractName => _name;
  String get uuid => _uuid;
  bool get isContractSigned => _isSigned;
  Map get document => _document;
  String get signDocUrl => _signedDocUrl;
  String get filePath => _filePath;
  List get signers => _signers;
  List get annotations => _annotations;
  String get message => _message;
  String get createdDate => _createdDate;
  String get blockchainTxHash => _blockchainTxHash;

  set id(int value) => _id = value;
  set annotations(List value) => _annotations = value;
  set signers(List value) => _signers = value;
  set filePath(String value) => _filePath = value;
  set blockchainTxHash(String value) => _blockchainTxHash = value;

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
        send: map['send'],
        blockchainTxHash: map['blockchain_tx_hash'], 
      );

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
        'signed_number': _signednumber,
        'isSigned': _isSigned,
        'send': send,
        'blockchain_tx_hash': _blockchainTxHash, 
      };
}
