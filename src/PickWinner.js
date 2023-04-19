import React, {useState, useEffect} from 'react';
import {ethers} from 'ethers';
import constants from './constants';


function PickWinner() {
    const [owner, setOwner] = useState('');
    const [contractInstance, setcontractInstance] = useState('');
    const [currentAccount, setCurrentAccount] = useState('');
    const [isOwnerConnected, setisOwnerConnected] = useState(false);
    const [winner, setWinner] = useState('');
    const [status, setStatus] = useState(false);

    useEffect(() => {
        const loadBlockchainData = async () => {
            if (typeof window.ethereum !== 'undefined') {
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                try {
                    const signer = provider.getSigner();
                    const address = await signer.getAddress();
                    console.log(address);
                    setCurrentAccount(address);
                    window.ethereum.on('accountsChanged', (accounts) => {
                        setCurrentAccount(accounts[0]);
                        console.log(currentAccount);
                    })
                } catch (err) {
                    console.error(err);
                }
            } else {
                alert('Please install Metamask to use this application')

            }
        };

        const contract = async () => {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const contractIns = new ethers.Contract(constants.contractAddress, constants.contractAbi, signer);
            setcontractInstance(contractIns);
            const status = await contractInstance.isComplete();
            setStatus(status);
            const winner = await contractInstance.getWinner();
            setWinner(winner);
            const owner = await contractInstance.getManager();
            setOwner(owner);
            if (owner === currentAccount) {
                setisOwnerConnected(true);
            }
            else {
                setisOwnerConnected(false);
            }
        }

        loadBlockchainData();
        contract();
    }, [currentAccount]);


    const pickWinner = async () => {
        const tx = await contractInstance.pickWinner();
        await tx.wait();
    }

    return (
        <div className='container'>
            <h1>Result Page</h1>
            <div className='button-container'>
                 {status ? (<p>Lottery Winner is : {winner}</p>) : 
                 ( isOwnerConnected ? (<button className="enter-button" onClick={pickWinner}> Pick Winner </button>) : 
                 (<p>You are not the owner</p>))

                 }
            </div>
        </div>
    )

}

export default PickWinner;