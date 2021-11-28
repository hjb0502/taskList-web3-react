import React, { Component } from 'react'
import Web3 from 'web3'
import './App.css'
import { TASK_LIST_ABI, TASK_LIST_ADDRESS } from './contract.config'
import TaskList from './TaskList'

class App extends Component {
  componentWillMount() {
    this.loadBlockchainData()
  }

  async loadBlockchainData() {
    const web3 = new Web3(Web3.givenProvider || "http://localhost:7545")
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })
    const taskList = new web3.eth.Contract(TASK_LIST_ABI, TASK_LIST_ADDRESS)
    this.setState({ taskList })
    // const task = await taskList.methods.tasks(0).call()
    // console.log("taskList.methods",taskList.methods);
    const taskCount = await taskList.methods.taskCount().call()
    this.setState({ taskCount })
    for (var i = 1; i <= taskCount; i++) {
      const task = await taskList.methods.tasks(i).call()
      this.setState({
        tasks: [...this.state.tasks, task]
      })
    }
    this.setState({ loading: false })
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '',
      taskCount: 0,
      tasks: [],
      loading: true
    }
    this.createTask = this.createTask.bind(this)
    this.toggleCompleted = this.toggleCompleted.bind(this)
  }

  render() {
    return (
      <div>
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <a className="navbar-brand col-sm-3 col-md-2 mr-0" href="https://github.com/hjb0502/tast-list" target="_blank">Qualified!Dev | Task List</a>
          <ul className="navbar-nav px-3">
            <li className="nav-item text-nowrap d-none d-sm-none d-sm-block">
              <small><a className="nav-link" href="#"><span id="account"></span></a></small>
            </li>
          </ul>
        </nav>
        <div className="container-fluid">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex justify-content-center">
              { this.state.loading
                ? <div id="loader" className="text-center"><p className="text-center">Loading...</p></div>
                : <TaskList tasks={this.state.tasks} 
                  createTask={this.createTask}
                  toggleCompleted = {this.toggleCompleted} />
              }
            </main>
          </div>
        </div>
      </div>
    );
  }

  createTask(content) {
    // console.log(content)
    this.setState({ loading: true })
    try{
      this.state.taskList.methods.createTask(content).send({ from: this.state.account })
      .once('receipt', (receipt) => {
        this.setState({ loading: false })
      })
    } catch (error) {
        console.log(error);
        this.setState({ loading: false })
    }
  }

  toggleCompleted(taskId) {
    this.setState({ loading: true })
    this.state.taskList.methods.toggleCompleted(taskId).send({ from: this.state.account })
    .once('receipt', (receipt) => {
      this.setState({ loading: false })
    })
  }
}

export default App;