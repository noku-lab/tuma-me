import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Button, Card } from 'react-native-paper';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console (will appear in terminal)
    console.error('═══════════════════════════════════════');
    console.error('🚨 ERROR BOUNDARY CAUGHT REACT ERROR');
    console.error('═══════════════════════════════════════');
    console.error('Error:', error);
    console.error('Error Message:', error.message);
    console.error('Error Stack:', error.stack);
    if (errorInfo) {
      console.error('Component Stack:', errorInfo.componentStack);
    }
    console.error('═══════════════════════════════════════');
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.title}>⚠️ Something went wrong</Text>
              <Text style={styles.subtitle}>
                Check the terminal for detailed error information
              </Text>
              
              {this.state.error && (
                <ScrollView style={styles.errorContainer}>
                  <Text style={styles.errorTitle}>Error:</Text>
                  <Text style={styles.errorText}>
                    {this.state.error.toString()}
                  </Text>
                </ScrollView>
              )}
              
              <Button
                mode="contained"
                onPress={this.handleReload}
                style={styles.button}
              >
                Try Again
              </Button>
            </Card.Content>
          </Card>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  card: {
    width: '100%',
    maxWidth: 500,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#666',
  },
  errorContainer: {
    maxHeight: 200,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#d32f2f',
  },
  button: {
    marginTop: 10,
  },
});

export default ErrorBoundary;
