import React, { Component } from 'react';
import api from '../../services/api';

import { MdInsertDriveFile, MdClose } from 'react-icons/md';
import { distanceInWords } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Dropzone from 'react-dropzone';

import socket from 'socket.io-client';

import Circle from 'react-circle';

import logo from '../../assets/logo.svg';
import './styles.css';

export default class Box extends Component {
  state = { 
    box: {},
    loading: false,
    contagem: 0,
    total: 100,
    style: {
      opacity: 1.0
    }
  };

  async componentDidMount() {
    this.atualizaGrid();

    const box = this.props.match.params.id;
    const response = await api.get(`boxes/${box}`);

    this.setState({ box: response.data });
  }

  formUpload = files => {
    this.setState({ loading: true });
    this.setState({ opacity: 0.3 });

    files.forEach(async file => {
      let data = new FormData();
      const box = this.props.match.params.id;

      const progressUpload = {
        onUploadProgress: (progress) => {
          let progresso = Math.floor((progress.loaded * 100) / progress.total);
          this.setState({ contagem: progresso });
          return progresso;
        }
      }

      data.append('file', file);
      
      await api.post(`boxes/${box}/files`, data, progressUpload).then(() => {
        this.setState({ contagem: 0 });
        this.setState({ opacity: 1.0 });
      });
      
    });

    this.setState({ loading: false });
  }

  atualizaGrid = async () => {
    const box = this.props.match.params.id;
    const io = socket('https://node-api-box.herokuapp.com');

    io.emit('connectRoom', box);
    await io.on('file', data => {
      this.setState({ box: { ...this.state.box, files: [data, ...this.state.box.files] } })
    });
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

        <Dropzone onDropAccepted={this.formUpload} className="dropzone" style={{width:"100%",height : "20%",border : "1px solid black", textAlign: "center"}}>
          {({ getRootProps, getInputProps }) => (
            <div className="upload" {...getRootProps()}>
              <input {...getInputProps()} />

              <p>Arraste arquivos ou clique aqui</p>
            </div>
          )}
        </Dropzone>

        <ul>
          <span className="loaderCircle">
            <Circle
              progress={this.state.contagem}
              progressColor="#7159c1" 
            />
          </span>

          <div className="div-list" style={this.state.style}>
            { this.state.box.files && this.state.box.files.map(file => 
              (
                <li key={file.id}>
                  <a className="fileInfo" href={file.url} target="_blank">
                    {/* icone */}
                    <MdInsertDriveFile  size={24} color="#A5Cfff" />
                    <strong>{file.title}</strong>
                  </a>

                  <span className="timeUpload">
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
          </div>
        </ul>
      </div>
    );
  }
}
