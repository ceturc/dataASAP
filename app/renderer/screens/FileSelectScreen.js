import _ from 'lodash';
import React, { Component } from 'react';
//import Dropzone from 'react-dropzone';
import { connect } from 'react-redux';
import * as actions from '../actions';
import { Form, Button, Divider, 
        Segment, Label, Table, Icon } from 'semantic-ui-react';
import testTransactionHeader from '../services/testTransactionHeader';
import deidentifyStrategy from '../services/deidentifyStrategy';

// THIS CREATES A PROBLEM; This is the one to fix; CAN YOU MOVE THIS TO MAIN.JS??
//import { remote } from 'electron';
import replaceControlCharacters from '../services/replaceControlChars';
import restoreControlCharacters from '../services/restoreControlCharacters';
import { ipcRenderer } from 'electron';

// THIS CREATES A PROBLEM; I don't think this is even used
//import { copy } from 'fs-extra-p';


// THIS PROBABLY WILL CREATE A PROBLEM TOO
//const fs = window.require('fs');
//const dialog = remote.dialog;

class FileSelectScreen extends Component {
  state = {
    hovering: false,
    value: '',
    version: '',
    inputTextArea: '',
    input: '',
    deidDisabled: true,
    deidTextArea: '',
    saveAsDisabled: true,
    sendToDisabled: true,
    show: 'unhide',
    showDisplay: 'Show Changes',
    transactionInfo: {type: "N/A", version: "N/A", transaction: "N/A", segmentSeparator: "", fieldSeparator: ""}
  }

     clearInputTextArea = () => {
        document.getElementById('displayContent').innerHTML = '';
      this.setState({inputTextArea: '', deidDisabled: true, input: '', 
      textChanged: false, transactionInfo: {type: "N/A", version: "N/A", transaction: "N/A"}});
    }

    clearDeidTextArea = () => {
        document.getElementById('deIDContent').innerText = '';
        this.setState({deidTextArea: '', saveAsDisabled: true, sendToDisabled: true,show:'unhide', showDisplay:'Show Changes'});
    }
/*
    enableSaveAsButton = () => {
        this.setState({saveAsDisabled: false});
    }

 //   saveAs = () => {
 //       console.log(dialog);
 //   }
*/
  deidentifyData = () => {
        var deIDData = deidentifyStrategy(this.state.input ,this.state.transactionInfo);
        var displayDeIDData = replaceControlCharacters(deIDData);
        document.getElementById('deIDContent').innerHTML = displayDeIDData;
        this.setState({deidTextArea: deIDData, saveAsDisabled: false, sendToDisabled: false, show:'unhide', showDisplay:'Show Changes'});
  }
  
  saveFile = () => {  
    var content = this.state.deidTextArea; 

    ipcRenderer.send('folder:open', content);
/*
    dialog.showSaveDialog((fileName) => {
      //http://mylifeforthecode.com/getting-started-with-standard-dialogs-in-electron/

        if(fileName === undefined) {
            console.log("you did not enter a file name");
            return;
        }

        var rawContent = content.replace(/<[^>]+>/g, "");
        fs.writeFile(fileName, rawContent, (error) => {  
            if(null){ 
                console.log("Error Saving File ", error);
                // maybe pop up an alert
            }
        });
        
  //  }); 
*/    
  }



  showChanges = () => {
    var elements = document.getElementsByClassName("deid");

    if(this.state.show === "hide") {
        for (var i = 0; i < elements.length; i++) {
           elements[i].style.backgroundColor="white";
       }
    
        this.setState({show: "unhide", showDisplay: "Show Changes"})
    } else {
        for (var i = 0; i < elements.length; i++) {
            elements[i].style.backgroundColor="yellow";
        }
 
        this.setState({show: "hide", showDisplay: "Hide Changes"})
    }
  }

  /*
  onDrop = (files) => {
    // invalid file types are not added to files object
    const fileList = _.map(files, ({ name, path, size, type }) => {
      return { name, path, size, type };
    });

    if (fileList.length) {
      this.props.addFiles(fileList);
      
      if (!this.props.small) {
        this.props.history.push('/convert');
      }
    }

  }
*/
   copyToClipboard = () => {

    // TODO: Just get what is selected
       // sourece https://hackernoon.com/copying-text-to-clipboard-with-javascript-df4d4988697f
              
       var copyText = document.getElementById('deIDContent').textContent;
       
        const el = document.createElement('textarea');
        
        var dd = restoreControlCharacters(copyText);
        el.value = dd;
        el.setAttribute('readonly', '');    // make it tamper proof
        el.style.position = 'absolute';     // move outside the screen 
        el.style.left = '-9999px';          // so it is invisible

        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
    }


  divPaste = (event) => {
    event.preventDefault();
    var input = event.clipboardData.getData('Text');
    var displayStr = replaceControlCharacters(input);
    document.getElementById('displayContent').innerHTML = displayStr;
    
    
    var transactionInfo = testTransactionHeader(input);
    
    if(transactionInfo.type !== "UNKNOWN") {
        this.setState({input, transactionInfo, deidDisabled: false});
    }
    else 
        this.setState({ input,  transactionInfo});
    }

    /*
  renderChildren({ isDragActive, isDragReject }) {
    if (isDragActive) {
      return <h4 className="drop-message">Omnomnom, let me have those files!</h4>;
    } else if (isDragReject) {
      return <h4 className="drop-message">Uh oh, I don't know how to deal with that type of file!</h4>;
    } else {
      return <p className="drop-message1">Attach files by dragging & dropping, selecting them, or pasting from the clipboard.</p>
    }
  }
*/
  render() {
    
    return (
        <div>
            <Segment>
                <Label size='big'>Format Detected</Label>
                <Table>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>Type: {this.state.transactionInfo.type}</Table.HeaderCell>
                            <Table.HeaderCell>Version: {this.state.transactionInfo.version}</Table.HeaderCell>
                            <Table.HeaderCell>Transaction: {this.state.transactionInfo.transaction}</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                </Table>
            </Segment>

            <Divider horizontal /> 
            <Segment>
                <Form>
                    <Label size='big' pointing='below'>Paste Data Here</Label>
                   <div contentEditable
                        id="displayContent"
                        onPaste={this.divPaste}
                        style={{minHeight: 200, border: '2px solid black', 
                        borderRadius: '5px 5px 0px 0px', borderStyle: 'solid'}}>
                        
                        </div>
                                            
                    <Segment basic floated="right" clearing>
                        <Button primary  content="Clear" onClick={this.clearInputTextArea} />
                        <Button primary  content="De-Identify" disabled={this.state.deidDisabled} onClick={this.deidentifyData} />
                    </Segment>
                </Form>
            </Segment>
            <Divider horizontal /> 
            <Divider horizontal /> 
            <Divider horizontal /> 
            <Divider horizontal /> 

            <Segment>
                    <Form>
                        <Label size='big' pointing='below'>De-Identified Data</Label>
                       <Label as='a' onClick={this.copyToClipboard} size='big'>
                        <Icon name='clipboard' 
                        />Copy to Clipboard
                        </Label>
    
                       <Label as='a' onClick={this.showChanges} size='big'>
                        <Icon name={this.state.show} 
                        />{this.state.showDisplay}
                       </Label>
    
                    <div 
                        id="deIDContent"
                        onCopy={this.copyToClipboard}
                        style={{minHeight: 200, border: '2px solid black', 
                        borderRadius: '5px 5px 0px 0px'}}>    
                    </div>
                    
                    <Segment basic floated="right" clearing>
                        <Button primary  content="Clear" onClick={this.clearDeidTextArea} />
                        <Button primary  content="Save As..." 
                            onClick={this.saveFile} 
                            disabled={this.state.saveAsDisabled}  />
                   </Segment>
                    </Form>
            </Segment>
                
            </div>
    );
  }
}

export default connect(null, actions)(FileSelectScreen);