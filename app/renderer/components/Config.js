import _ from 'lodash';

import React, { Component } from 'react';
import NCPDP_D0_Config from '../configs/NCPDP_D0_Config';
import { Container, Segment, Accordion, Icon, Table, Input,  Checkbox, Button} from 'semantic-ui-react';
import { ipcRenderer } from 'electron';
const segmentNames = {
    "HEADER": "Transaction Header",
    "AM01" : "Patient Segment",
    "AM02" : "Pharmacy Provider Segment",
    "AM03" : "Prescriber Segment",
    "AM04" : "Insurance Segment",
    "AM05" : "COB/Other Payments Segment",
    "AM06" : "Worker's Compensation Segment",
    "AM07" : "Claim Segment",
    "AM08" : "DUR/PPS Segment",
    "AM09" : "Coupon Segment",
    "AM10" : "Compound Segment",
    "AM11" : "Pricing Segment",
    "AM12" : "Prior Authorization Segment",
    "AM13" : "Clinical Segment",
    "AM14" : "Additional Information Segment",
    "AM15" : "Facility Segment",
    "AM16" : "Narrative Segment",
    "AM17" : "Purchaser Segment",
    "AM18" : "Service Provider Segment",
    "AM19" : "Intermediary Segment",
    "AM20" : "Response Message Segment",
    "AM21" : "Response Status Segment",
    "AM22" : "Response Claim Segment",
    "AM23" : "Response Pricing Segment",
    "AM24" : "Response DUR/PPS Segment",
    "AM25" : "Response Insurance Segment",
    "AM26" : "Response Prior Authorization Segment",
    "AM27" : "Response Insurance Additional Segment",
    "AM28" : "Response COB/Other Payer Segment",
    "AM29" : "Response Patient Segment",
    "AM30" : "Financial Information Reporting Request Segment",
    "AM31" : "Request Reference Segment",
    "AM32" : "Request Financial Segment",
    "AM33" : "Financial Information Reporting Response Mesage Segment",
    "AM34" : "Financial Information Reporting Response Status Segment",
    "AM35" : "Response Financial Segment",
    "AM36" : "Response Intermediary Segment",
    "AM37" : "Last Known 4Rx Segment",
}

class Config extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activeIndex: 0,
            itemsToSave: false
        };
    }

    handleSaveClick = (e, content) => {
        console.log("sending to ipcMain", NCPDP_D0_Config);
        ipcRenderer.send('saveConfig', NCPDP_D0_Config);
    };

    handleOnChangeDefaultValue = (e, data) => {
        _.forEach(NCPDP_D0_Config, (value, key) => {
            if(value.displayName === data.name) {
                NCPDP_D0_Config[key].defaultValue = data.value;
            }
        });
        this.setState({itemsToSave: true})
    }

    handleOnChangeDeid = (e, data) => {
        _.forEach(NCPDP_D0_Config, (value, key) => {
            if(value.displayName === data.name) {
                NCPDP_D0_Config[key].deidentify = (data.value == 'true') ? true : false;
            }
        });
        this.setState({itemsToSave: true})
    }

    handleClick = (e, titleProps) => {
        const { index } = titleProps
        const { activeIndex } = this.state;
        const newIndex = activeIndex === index ? -1 : index
    
        this.setState({ activeIndex: newIndex })
    }

    renderAccordion() {
        var segments = _.groupBy(NCPDP_D0_Config, 'location.segment');
        
        var ordered = {};
        _(segments).keys().sort().each(function (key) {
            ordered[key] = segments[key];
        });

        
        var header = {};
        header['HEADER'] =  ordered['HEADER'];
        delete ordered['HEADER'];
        let merged = {...header, ...ordered};

        var index = 0;
 
        return _.map(merged, (value, key) => {
            return (
                <div>
                    <Accordion.Title 
                        active={this.state.activeIndex === index}
                        key={index}
                        index={index}
                        onClick={this.handleClick}>
                        <Icon name='dropdown'  />
                        {key} - {segmentNames[key]}
                    </Accordion.Title>
                    <Accordion.Content
                        active={this.state.activeIndex === index}
                        key={index++ + 1}
                        >     
                        <Table>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell>Data Element</Table.HeaderCell>
                                    <Table.HeaderCell>Deidentify</Table.HeaderCell>
                                    <Table.HeaderCell>Default Value</Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                            {this.renderRows(value)}
                            </Table.Body>
                        </Table>
                        
                    </Accordion.Content>
                </div>
                
            );
        });
    }

    renderRows(rows) {
        let index = 0;
        return _.map(rows, row => {           
            return(
            <Table.Row key={index++}>
                <Table.Cell>{row.displayName} - ({row.location.dataElementId})</Table.Cell>
                <Table.Cell>
                    <Checkbox className='radio'
                        label='Yes'
                        name={row.displayName}
                        value='true'
                        checked={row.deidentify == true}
                        onChange={this.handleOnChangeDeid }
                        style={{'padding':5}}/>
                    <Checkbox className='radio'
                        label='No'
                        name={row.displayName}
                        value='false'
                        checked={row.deidentify == false} 
                        onChange={this.handleOnChangeDeid}/>
                    </Table.Cell>
                <Table.Cell><Input name={row.displayName} onChange={this.handleOnChangeDefaultValue} 
                    defaultValue={row.defaultValue}/></Table.Cell>
            </Table.Row>
            )
        });        
    }

    render() {
        return (
            <Container>
                <Segment clearing >
                    <Button primary 
                        disabled={!this.state.itemsToSave}
                        floated='right' 
                        onClick={this.handleSaveClick}>Save</Button>
                    <Button primary floated='right'>Cancel</Button>
                </Segment>
                <Accordion fluid styled>
                    {this.renderAccordion()}
                </Accordion> 
            </Container>
        )
    }
}

export default Config;