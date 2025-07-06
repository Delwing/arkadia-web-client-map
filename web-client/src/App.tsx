import React from 'react';

export default function App() {
  return (
    <div id="main-container">
      <div id="iframe-container">
        <canvas id="map" resize="true"></canvas>
        <div id="map-progress-container" className="position-absolute top-50 start-50 translate-middle w-75">
          <div className="progress">
            <div id="map-progress-bar" className="progress-bar progress-bar-striped progress-bar-animated" style={{width: 0}} />
          </div>
        </div>
      </div>
      <div id="main_text_output_msg_wrapper"></div>
      <div id="input-area">
        <input type="text" id="message-input" autoComplete="off" autoCapitalize="off" spellCheck={false} />
        <button id="send-button">➢</button>
        <button id="connect-button">Connect</button>
        <button id="docs-button">Docs</button>
      </div>
      <div id="mobile-direction-buttons" className="mobile-direction-buttons">
        <div className="mobile-top-buttons">
          <button className="mobile-button top-button" id="bracket-right-button">]</button>
          <button className="mobile-button top-button" id="button-1">1</button>
          <button className="mobile-button top-button" id="button-2">2</button>
          <button className="mobile-button top-button" id="button-3">3</button>
        </div>
        <div className="mobile-direction-main">
          <div className="mobile-direction-grid">
            <button className="mobile-button direction-button" id="nw-button">↖</button>
            <button className="mobile-button direction-button" id="n-button">↑</button>
            <button className="mobile-button direction-button" id="ne-button">↗</button>
            <button className="mobile-button direction-button" id="w-button">←</button>
            <button className="mobile-button direction-button" id="c-button">zerknij</button>
            <button className="mobile-button direction-button" id="e-button">→</button>
            <button className="mobile-button direction-button" id="sw-button">↙</button>
            <button className="mobile-button direction-button" id="s-button">↓</button>
            <button className="mobile-button direction-button" id="se-button">↘</button>
          </div>
          <div className="mobile-right-buttons">
            <button className="mobile-button direction-button" id="u-button">u</button>
            <button className="mobile-button direction-button" id="d-button">d</button>
            <button className="mobile-button direction-button" id="special-exit-button" title="">3</button>
          </div>
        </div>
      </div>
    </div>
  );
}
