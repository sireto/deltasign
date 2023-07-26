class Annotationn {
  List indexpages = [];
  List email = [];
  Map<String, List<double>> dimension = {
    'x1': [],
    'x2': [],
    'y1': [],
    'y2': [],
  };
  List color = [];
  Annotationn(this.indexpages, this.email, this.dimension, this.color);
  List value() {
    List valuee = [
      for (int i = 0; i < email.length; i++)
        {
          "x1": dimension["x1"][i],
          "x2": dimension["x2"][i],
          "y1": dimension["y1"][i],
          "y2": dimension["y2"][i],
          'signer': email[i].toString().toLowerCase(),
          'page': indexpages[i] - 1,
          'color': color[i],
        }
    ];
    return valuee;
  }

  get emaill {
    return email.toSet();
  }

  get indexpagess {
    return indexpages;
  }

  get colors {
    return color;
  }
}
