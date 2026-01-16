// Mock React Native to avoid parsing TypeScript/Flow files
module.exports = {
  Platform: {
    OS: 'ios',
    select: jest.fn((obj) => obj.ios || obj.default),
  },
  StyleSheet: {
    create: (styles) => styles,
    absoluteFillObject: {},
    flatten: jest.fn(),
  },
  View: 'View',
  Text: 'Text',
  ScrollView: 'ScrollView',
  Image: 'Image',
  Alert: {
    alert: jest.fn(),
  },
  ActivityIndicator: 'ActivityIndicator',
  KeyboardAvoidingView: 'KeyboardAvoidingView',
  FlatList: 'FlatList',
  TouchableOpacity: 'TouchableOpacity',
  TouchableHighlight: 'TouchableHighlight',
  SafeAreaView: 'SafeAreaView',
};
