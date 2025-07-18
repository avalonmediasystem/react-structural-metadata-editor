import React from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import Root from '../../src';
import 'bootstrap/dist/css/bootstrap.min.css';
import './app.css';

const App = (props) => {
  const [manifestUrl, setManifestUrl] = React.useState(props.manifestURL);
  const [userUrl, setUserUrl] = React.useState(props.manifestURL);

  const handleSubmit = (e) => {
    e.preventDefault();
    setManifestUrl(userUrl);
  };

  const handleChange = (e) => {
    setManifestUrl();
    setUserUrl(e.target.value);
  };

  return (
    <Container fluid className="sme-demo-container">
      <h1>Structural Metadata Editor</h1>
      <p>
        A ReactJS component, which displays structural information of an A/V resource,
        in a IIIF Presentation 3.0 manifest. The visualized waveform helps to navigate
        sections of the audio waveform. More details and source code of the component is
        available in the <a href="https://github.com/avalonmediasystem/react-structural-metadata-editor"
          target="_blank">
          GitHub repository</a>.
      </p>
      <Card className="m-3 sme-demo-form">
        <InputGroup className="p-4">
          <Form.Control
            placeholder="Manifest URL"
            aria-label="Manifest URL"
            aria-describedby="manifest-url"
            value={userUrl}
            onChange={handleChange}
          />
          <Button variant="primary" onClick={handleSubmit}>Set Manifest</Button>
        </InputGroup>
      </Card>
      {(!manifestUrl)
        ? <div className="loading-app"><div></div><div></div><div></div></div>
        : <Root
          structurURL={props.structurURL}
          manifestURL={manifestUrl}
          canvasIndex={0}
          structureIsSaved={(val) => { }}
          disableSave={props.disableSave}
          key={manifestUrl}
        />
      }
    </Container>
  );
};

export default App;
