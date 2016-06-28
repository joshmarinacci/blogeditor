class PostsList extends React.Component {
    render() {
        //console.log("rendering with posts",this.props.posts);
        var posts = this.props.posts.map((post,i) => {
            return <li key={i}>{post.title}</li>
        });
        return <div className="scroll posts-list"><ul>{posts}</ul></div>
    }
}