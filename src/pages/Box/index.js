import React, { Component } from 'react';
import api from '../../services/api';

import { MdInsertDriveFile, MdClose } from 'react-icons/md';
import { distanceInWords } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Dropzone from 'react-dropzone';

import socket from 'socket.io-client';

import logo from '../../assets/logo.svg';
import './styles.css';

export default class Box extends Component {
  state = { box: {} };

  async componentDidMount() {
    this.atualizaGrid();

    const box = this.props.match.params.id;
    const response = await api.get(`boxes/${box}`);

    this.setState({ box: response.data });
  }

  formUpload = (files) => {
    files.forEach(file => {
      let data = new FormData();
      const box = this.props.match.params.id;

      data.append('file', file);

      api.post(`boxes/${box}/files`, data);
    });
  }

  atualizaGrid = () => {
    const box = this.props.match.params.id;

    const io = socket('https://node-api-box.herokuapp.com');

    io.emit('connectRoom', box);
    io.on('file', data => {
      this.setState({ box: { ...this.state.box, files: [data, ...this.state.box.files] } })
    })
  }

  // deleteFile = () => {

  // }

  render() {
    return (
      <div id="box-container">
        <header>
          <img src={logo} />
          <h1>{this.state.box.title}</h1>
        </header>

        <Dropzone onDropAccepted={this.formUpload}>
          {({ getRootProps, getInputProps }) => (
            <div className="upload" {...getRootProps()}>
              <input {...getInputProps()} />

              <p>Arraste arquivos ou clique aqui</p>
            </div>
          )}
        </Dropzone>

        <ul>
          { this.state.box.files && this.state.box.files.map(file => 
            (
              <li key={file.id}>
                <a className="fileInfo" href={file.url} target="_blank">
                  {/* icone */}
                  <MdInsertDriveFile  size={24} color="#A5Cfff" />
                  <strong>{file.title}</strong>
                </a>

                <span class="timeUpload">
                  Há {" "}
                  {distanceInWords(file.createdAt, new Date(),
                    { locale: pt })
                  }
                  {" "} atrás
                </span>

                {/* <MdClose onDropAccepted={this.deleteFile} size={24} color="red" /> */}
              </li>
            ))
          }
        </ul>
      </div>
    );
  }
}
