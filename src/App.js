import logo from './logo.svg';
import React, { useRef, useEffect, useState } from 'react';
import './App.css';
import shaka from 'shaka-player/dist/shaka-player.ui.debug';

function App() {
  const controllerRef = useRef(null);
  const [assetLoaded, setAssetLoaded] = useState(false);

  const fairplayCertificateURI = "https://fairplay.gumlet.com/certificate/61f8d851266c91643c899b40";
  const fairplayLicenseURI = "https://fairplay.gumlet.com/licence/61f8d851266c91643c899b40  ";
  const HLSManifestURI = "https://video.gumlet.io/61f8d8cf63ae5601a4a7891b/62d952ddf9ecad4aedee96f0/main.m3u8";
  const widevineLicenseURI = "https://example.com/licence-url";
  
  const onError = (event) => {
    console.error('Error code', event.detail.code, 'object', event.detail) // eslint-disable-line no-console
  }

  const onPlaybackError = (error) => {
    // Log the error.
    console.error('Error while loading playback: code', error.code, 'object', error);
  }

  async function loadAssetWithFairplay() {
      const req = await fetch(fairplayCertificateURI);
      const cert = await req.arrayBuffer();

      let video = controllerRef.current;
    
      let player = new shaka.Player(video);

      player.addEventListener('error', onError)

      player.configure({
        drm: {
            servers: {
              // YOUR LICENSE SERVER GOES HERE:
              'com.apple.fps.1_0': fairplayLicenseURI,
            },
            advanced: {
                'com.apple.fps.1_0':{
                  serverCertificate: new Uint8Array(cert)
                }
            }
        }
      });

      player.getNetworkingEngine().registerRequestFilter((type, request) => {
        if (type != shaka.net.NetworkingEngine.RequestType.LICENSE) {
            return;
        }
        const originalPayload = new Uint8Array(request.body);
        let spc_string = btoa(String.fromCharCode.apply(null, new Uint8Array(request.body)));
        
        request.headers['Content-Type'] = 'application/json';
        request.body = JSON.stringify({
            "spc" : spc_string
        });
      });

      player.getNetworkingEngine().registerResponseFilter((type, response) => {
          if (type != shaka.net.NetworkingEngine.RequestType.LICENSE) {
              return;
          }

          let responseText = shaka.util.StringUtils.fromUTF8(response.data);
          const parsedResponse = JSON.parse(responseText);
          response.data = shaka.util.Uint8ArrayUtils.fromBase64(parsedResponse.ckc).buffer;
      });

      player.load(HLSManifestURI).then(function() {
        setAssetLoaded(true);
        console.log('The video has now been loaded!');
      }).catch(onPlaybackError);
  }

  async function loadAssetWithWidevine() {
    const response = await fetch(widevineLicenseURI);
    const json = await response.json();

    let video = controllerRef.current;
  
    let player = new shaka.Player(video);

    player.addEventListener('error', onError);

    player.configure({
      drm: {
        servers: {
          'com.widevine.alpha': json.license
        },
        advanced: {
          'com.widevine.alpha': {
            'videoRobustness': 'SW_SECURE_CRYPTO',
            'audioRobustness': 'SW_SECURE_CRYPTO'
          }
        }
      }
    });

    player.load(HLSManifestURI).then(function() {
      setAssetLoaded(true);
      console.log('The video has now been loaded!');
    }).catch(onPlaybackError); 
  }

  useEffect(() => {
    if (controllerRef.current.canPlayType('application/vnd.apple.mpegurl') && !assetLoaded) {
      loadAssetWithFairplay();
    }else if(!controllerRef.current.canPlayType('application/vnd.apple.mpegurl') && !assetLoaded){
      loadAssetWithWidevine();
    }
  });

  return (
    <div className="App">
      <h1>Gumlet Video DRM TEST</h1>
      <video ref={controllerRef} preload="none" autoPlay={false} width="640" height="264" controls muted></video>
    </div>
  );
}

export default App;
