exports.paginate = (page, pageSize, orderBy, direction) => {
    const offset = parseInt(page - 1) * parseInt(pageSize);
    const limit = parseInt(pageSize);
    const order = [[orderBy || "createdAt", direction || "DESC"]];
    return {
      offset,
      limit,
      order
    };
  };