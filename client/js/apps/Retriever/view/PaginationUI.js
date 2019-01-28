import React from 'react';
import ReactPaginate from 'react-paginate';

class PaginationUI extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
           active_page: 1
         };

    }

    render() {
        return (
              <ReactPaginate previousLabel={"prev"}
                             nextLabel={"next"}
                             pageCount={Math.ceil(this.props.n_items_found/100)}
                             marginPagesDisplayed={1}
                             pageRangeDisplayed={3}
                             onPageChange={this.handle_click.bind(this)}
                             containerClassName={"pagination"}
                             subContainerClassName={"pages pagination"}

                             activeClassName={"active"}
                             breakClassName="page-item"
                             breakLabel={<a className="page-link">...</a>}
                             pageClassName="page-item"
                             previousClassName="page-item"
                             nextClassName="page-item"
                             pageLinkClassName="page-link"
                             previousLinkClassName="page-link"
                             nextLinkClassName="page-link"
                             />
        );
    }

    handle_click(data) {
      let i_page = data.selected;
      this.props.onclick(i_page);
    };

}

export default PaginationUI;
