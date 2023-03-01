import React from 'react';
import { FormControl, InputGroup, Card, Button, Container } from 'react-bootstrap';
import Root from '../../src';
import './app.css';

const App = (props) => {
  const [manifestUrl, setManifestUrl] = React.useState(props.manifestURL);
  const [userUrl, setUserUrl] = React.useState(props.manifestURL);

  const handleSubmit = (e) => {
    e.preventDefault();
    setManifestUrl(userUrl);
  }

  const handleChange = (e) => {
    setManifestUrl();
    setUserUrl(e.target.value);
  }

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
          <FormControl
            placeholder="Manifest URL"
            aria-label="Manifest URL"
            aria-describedby="manifest-url"
            value={userUrl}
            onChange={handleChange}
          />
          <InputGroup.Append>
            <Button variant="primary" onClick={handleSubmit}>Set Manifest</Button>
          </InputGroup.Append>
        </InputGroup>
      </Card>
      {(!manifestUrl) 
        ? <div className="loading-app"><div></div><div></div><div></div></div>
        : <Root 
            structurURL={props.structurURL}
            manifestURL={manifestUrl}
            canvasIndex={0}
            structureIsSaved={(val) => {}}
            disableSave={props.env === 'prod' ? true : false }
            key={manifestUrl}
          />
      }
    </Container>
  )
}

export default App;
