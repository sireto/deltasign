import 'dart:convert';

class DocumentModel {
  int _id;
  String _uuid;
  String _fileName;
  String _fileHash;
  String _pdfLink;
  String _createdDate;
  String _filePath;
  Map _properties;

  DocumentModel({
    int id,
    String uuid,
    String pdfLink,
    String fileHash,
    String fileName,
    String createdDate,
    String filePath,
    Map properties,
  }) {
    _id = id;
    _uuid = uuid;
    _fileName = fileName;
    _pdfLink = pdfLink;
    _fileHash = fileHash;
    _createdDate = createdDate;
    _filePath = filePath;
    _properties = properties;
  }
  int get id {
    return _id;
  }

  String get uuid {
    return _uuid;
  }

  String get pdfLink {
    return _pdfLink;
  }

  String get fileHash {
    return _fileHash;
  }

  String get fileName {
    return _fileName;
  }

  Map get properties {
    return _properties;
  }

  String get createdDate => _createdDate;

  String get filePath => _filePath;

  set filePath(String value) {
    _filePath = value;
  }

  set id(int value) {
    _id = value;
  }

  set fileName(String value) {
    _fileName = value;
  }

  factory DocumentModel.fromMap({int id, Map<String, dynamic> map}) =>
      DocumentModel(
        id: id,
        uuid: map['uuid'],
        fileName: map['filename'],
        pdfLink: map['s3_url'],
        fileHash: map['file_hash'],
        createdDate: map['created_date'],
        filePath: map['filePath'],
        properties: jsonDecode(map['properties']),
      );

  Map<String, dynamic> toMap() => {
        'id': _id,
        'uuid': _uuid,
        's3_url': _pdfLink,
        'file_hash': _fileHash,
        'filename': _fileName,
        'created_date': _createdDate,
        'filePath': _filePath,
        'properties': jsonEncode(_properties),
      };
}
