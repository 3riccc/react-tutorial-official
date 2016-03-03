// 在这里时模拟数据，最终的数据将会来源于服务器
var data = [
	{author: "Eric", text: "This is one comment"},
	{author: "NetEase", text: "This is *another* comment"}
];

// 评论box，他是下面所有组件的长辈
var CommentBox = React.createClass({
	// 从服务器读取评论
	loadCommentsFromServer: function() {
		$.ajax({
		    url: this.props.url,
		    dataType: 'json',
		    cache: false,
		    success: function(data) {
		        this.setState({data: data});
		    }.bind(this),
		    error: function(xhr, status, err) {
		        console.error(this.props.url, status, err.toString());
		    }.bind(this)
		});
	},
	// 将新的评论发送给服务器
	handleCommentSubmit:function(data){
		$.ajax({
		    url: this.props.url,
		    dataType: 'json',
		    type: 'POST',
		    data: data,
		    success: function(data) {
		        this.setState({data: data});
		    }.bind(this),
		    error: function(xhr, status, err) {
		        console.error(this.props.url, status, err.toString());
		    }.bind(this)
		});
	},
	getInitialState: function() {
	    return {data: []};
	},
	componentDidMount: function() {
	    this.loadCommentsFromServer();
	    setInterval(this.loadCommentsFromServer, this.props.pollInterval);
	},
	render:function(){
		return (
			<div className = "commentBox">
				<h2>comment box.</h2>
				<CommentList data={this.state.data}/>
				<CommentForm handle={this.handleCommentSubmit}/>
			</div>
		);
	}
});
// 评论列表
var CommentList = React.createClass({
	render:function(){
		// 这里的饮用是由于CommentList组件将data赋值为一个属性
		var commentNodes = this.props.data.map(function(comment){
			return(
				// comment.xxx相当于this.props.data[author]或者this.props.data[text]
				<Comment author={comment.author}>
					{comment.text}
				</Comment>
				// 每次调用都会返回comment一个组件
			);
		});
		return(
			<div className="commenList">
				{commentNodes}
			</div>
		);
	}
});
// 评论输入框
var CommentForm = React.createClass({
	handleSubmit:function(event){
		console.log(event);
		event.preventDefault()
		var author = this.refs.author.value;
		var text = this.refs.text.value;
		this.props.handle({author:author,text:text});
	},
	render:function(){
		return (
			<form className = "commentForm">
				<input type="text" placeholder="输入你的名字" ref="author"/>
				<input type="text" placeholder="输入你的评论内容" ref="text"/>
				<button onClick={this.handleSubmit}>评论</button>
			</form>
		);
	}
});
// 具体的一条评论
var Comment = React.createClass({
	rawMarkup: function() {
	    var rawMarkup = marked(this.props.children.toString(), {sanitize: true});
	    return { __html: rawMarkup };
	},
	render:function(){
		return (
			<div className="comment">
				<h3 className="commentAuthor">{this.props.author}</h3>
				<span dangerouslySetInnerHTML={this.rawMarkup()} />
			</div>
		);
	}
});
ReactDOM.render(
	// 把data传入CommentBox组件
	<CommentBox url='/api/comments' pollInterval="2000"/>,
	document.getElementById('content')
);