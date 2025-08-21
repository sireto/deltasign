extension Ellipsis on String {
  String ellipsis({int head = 8, int tail = 8}) {
    if (length <= head + tail) return this;
    return '${substring(0, head)}...${substring(length - tail)}';
  }
}
