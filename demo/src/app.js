import React from 'react';
import { FormControl, InputGroup, Card, Button, Container } from 'react-bootstrap';
import Root from '../../src';

const styles = {
  card: {
    backgroundColor: '#f0f0f0'
  },
  p: {
    color: '#7e7e7e'
  }
}

const App = (props) => {
  const [manifestUrl, setManifestUrl] = React.useState(props.manifestURL);
  const [structureUrl, setStructureUrl] = React.useState(props.structureURL)
  const [userURL, setUserURL] = React.useState(props.manifestURL);

  React.useEffect(() => {
    setManifestUrl(manifestUrl);
  }, [manifestUrl])
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('setting manifest URL: ', userURL);
    setManifestUrl(userURL);
  }

  const handleChange = (e) => {
    setManifestUrl();
    setUserURL(e.target.value);
  }

  return (
    <Container fluid className="sme-demo-container">
      <h1>Structural Metadata Editor</h1>
      <p style={styles.p}>
        A ReactJS component, which displays structural information of an A/V resource,
        in a IIIF Presentation 3.0 manifest. It displays a visualized waveform to help
        navigate sections of the audio waveform.
      </p>
      <Card className="m-3" style={styles.card}>
        <InputGroup className="p-4">
          <FormControl
            placeholder="Manifest URL"
            aria-label="Manifest URL"
            aria-describedby="basic-addon2"
            value={userURL}
            onChange={handleChange}
          />
          <InputGroup.Append>
            <Button variant="primary" onClick={handleSubmit}>Set Manifest</Button>
          </InputGroup.Append>
        </InputGroup>
      </Card>
      <Root 
        structurURL={structureUrl}
        manifestURL={manifestUrl}
        canvasIndex={0}
        structureIsSaved={(val) => {}}
        disableSave={props.env === 'prod' ? true : false }
      />
    </Container>
  )
}

export default App;
